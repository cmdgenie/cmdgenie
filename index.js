#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration file path
const CONFIG_DIR = path.join(os.homedir(), '.cmdgenie');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

class CmdGenie {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(CONFIG_FILE)) {
                return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            }
        } catch (error) {
            console.error('Error loading config:', error.message);
        }

        return {
            provider: 'openai',
            apiKey: null,
            model: 'gpt-3.5-turbo'
        };
    }

    saveConfig() {
        try {
            if (!fs.existsSync(CONFIG_DIR)) {
                fs.mkdirSync(CONFIG_DIR, { recursive: true });
            }
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('Error saving config:', error.message);
        }
    }

    async updateLLM(provider, apiKey, model = null) {
        const providers = {
            'openai': { defaultModel: 'gpt-3.5-turbo' },
            'anthropic': { defaultModel: 'claude-3-haiku-20240307' },
            'google': { defaultModel: 'gemini-pro' },
            'cohere': { defaultModel: 'command' }
        };

        if (!providers[provider]) {
            console.error(`Unsupported provider: ${provider}`);
            console.log('Supported providers:', Object.keys(providers).join(', '));
            return;
        }

        this.config.provider = provider;
        this.config.apiKey = apiKey;
        this.config.model = model || providers[provider].defaultModel;

        this.saveConfig();
        console.log(`✅ LLM updated: ${provider} with model ${this.config.model}`);
    }

    async callOpenAI(prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    {
                        role: 'system',
                        content: `You are a command line expert. Generate only the exact command(s) needed for the user's request. 
            Respond with ONLY the command(s), no explanations or formatting. 
            If multiple commands are needed, separate them with &&.
            Detect the operating system context and provide appropriate commands.
            Current OS: ${os.platform()}`
                    },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 150,
                temperature: 0.1
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'OpenAI API error');
        }

        return data.choices[0].message.content.trim();
    }

    async callAnthropic(prompt) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.config.model,
                max_tokens: 150,
                messages: [
                    {
                        role: 'user',
                        content: `You are a command line expert. Generate only the exact command(s) needed for: "${prompt}". 
            Respond with ONLY the command(s), no explanations. 
            If multiple commands needed, separate with &&.
            Current OS: ${os.platform()}`
                    }
                ]
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Anthropic API error');
        }

        return data.content[0].text.trim();
    }

    async callGoogle(prompt) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a command line expert. Generate only the exact command(s) needed for: "${prompt}". 
            Respond with ONLY the command(s), no explanations. 
            If multiple commands needed, separate with &&.
            Current OS: ${os.platform()}`
                    }]
                }]
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Google API error');
        }

        return data.candidates[0].content.parts[0].text.trim();
    }

    async callCohere(prompt) {
        const response = await fetch('https://api.cohere.ai/v1/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.config.model,
                prompt: `You are a command line expert. Generate only the exact command(s) needed for: "${prompt}". 
        Respond with ONLY the command(s), no explanations. 
        If multiple commands needed, separate with &&.
        Current OS: ${os.platform()}

        Command:`,
                max_tokens: 100,
                temperature: 0.1
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Cohere API error');
        }

        return data.generations[0].text.trim();
    }

    async generateCommand(prompt) {
        if (!this.config.apiKey) {
            console.error('❌ No API key configured. Please run: cmdgenie --update-llm <provider> <api-key>');
            return;
        }

        console.log('🤖 Generating command...');

        try {
            let command;

            switch (this.config.provider) {
                case 'openai':
                    command = await this.callOpenAI(prompt);
                    break;
                case 'anthropic':
                    command = await this.callAnthropic(prompt);
                    break;
                case 'google':
                    command = await this.callGoogle(prompt);
                    break;
                case 'cohere':
                    command = await this.callCohere(prompt);
                    break;
                default:
                    throw new Error(`Unsupported provider: ${this.config.provider}`);
            }

            // Clean up the command
            command = command.replace(/```[\s\S]*?```/g, '').replace(/`/g, '').trim();

            console.log(`\n💡 Generated command: ${command}`);

            // Ask user if they want to execute
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('\n🚀 Execute this command? (y/N): ', async (answer) => {
                if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                    try {
                        console.log('\n📋 Executing...');
                        const { stdout, stderr } = await execAsync(command);
                        if (stdout) console.log(stdout);
                        if (stderr) console.error(stderr);
                    } catch (error) {
                        console.error('❌ Execution error:', error.message);
                    }
                }
                rl.close();
            });

        } catch (error) {
            console.error('❌ Error generating command:', error.message);
        }
    }

    showHelp() {
        console.log(`
🧞 CmdGenie - AI-Powered Command Generator

Usage:
  cmdgenie "your natural language request"
  cmdgenie --update-llm <provider> <api-key> [model]
  cmdgenie --help

Examples:
  cmdgenie "find all directories in current folder"
  cmdgenie "show disk usage"
  cmdgenie "kill process on port 3000"
  
Update LLM:
  cmdgenie --update-llm openai sk-your-api-key
  cmdgenie --update-llm anthropic your-api-key claude-3-haiku-20240307
  cmdgenie --update-llm google your-api-key gemini-pro
  cmdgenie --update-llm cohere your-api-key

Current config:
  Provider: ${this.config.provider}
  Model: ${this.config.model}
  API Key: ${this.config.apiKey ? '✅ Set' : '❌ Not set'}
`);
    }
}

// Main execution
async function main() {
    const genie = new CmdGenie();
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        genie.showHelp();
        return;
    }

    if (args[0] === '--update-llm') {
        if (args.length < 3) {
            console.error('❌ Usage: cmdgenie --update-llm <provider> <api-key> [model]');
            return;
        }
        await genie.updateLLM(args[1], args[2], args[3]);
        return;
    }

    // Main command generation
    const prompt = args.join(' ').replace(/^["']|["']$/g, '');
    await genie.generateCommand(prompt);
}

main().catch(console.error);