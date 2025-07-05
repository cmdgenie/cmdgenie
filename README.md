# 🧞 CmdGenie - AI-Powered Command Generator

Transform natural language into precise command line instructions using AI. CmdGenie supports multiple LLM providers and works across macOS, Windows, and Linux.

## ✨ Features

- 🤖 Multiple LLM providers (OpenAI, Anthropic, Google, Cohere)
- 🌍 Cross-platform support (macOS, Windows, Linux)
- 🔧 Configurable AI models and API keys
- 🚀 Interactive command execution
- 📝 Natural language to command translation
- 💾 Persistent configuration storage

## 🚀 Installation

### Via NPX (Recommended)
```bash
npx cmdgenie "find all directories"
```

### Global Installation
```bash
npm install -g cmdgenie
```

## 🔧 Setup

First, configure your preferred LLM provider:

### OpenAI
```bash
cmdgenie --update-llm openai sk-your-api-key-here
```

### Anthropic (Claude)
```bash
cmdgenie --update-llm anthropic your-api-key claude-3-haiku-20240307
```

### Google (Gemini)
```bash
cmdgenie --update-llm google your-api-key gemini-pro
```

### Cohere
```bash
cmdgenie --update-llm cohere your-api-key command
```

## 📖 Usage

### Basic Usage
```bash
cmdgenie "your natural language request"
```

### Examples
```bash
# File operations
cmdgenie "find all PDF files in current directory"
cmdgenie "delete all .log files older than 30 days"
cmdgenie "copy all images to backup folder"

# Process management
cmdgenie "kill process running on port 3000"
cmdgenie "show all running Python processes"

# System information
cmdgenie "show disk usage"
cmdgenie "display memory usage"
cmdgenie "list all installed packages"

# Network operations
cmdgenie "check if port 8080 is open"
cmdgenie "download file from URL"
```

### Help
```bash
cmdgenie --help
```

## 🔑 API Key Setup

### OpenAI
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Run: `cmdgenie --update-llm openai sk-your-key`

### Anthropic
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Run: `cmdgenie --update-llm anthropic your-key`

### Google AI
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Run: `cmdgenie --update-llm google your-key`

### Cohere
1. Go to [Cohere Dashboard](https://dashboard.cohere.ai/api-keys)
2. Create an API key
3. Run: `cmdgenie --update-llm cohere your-key`

## 🛠️ Configuration

Configuration is stored in `~/.cmdgenie/config.json`:

```json
{
  "provider": "openai",
  "apiKey": "your-api-key",
  "model": "gpt-3.5-turbo"
}
```

## 🔒 Security

- API keys are stored locally in your home directory
- No data is sent to external services except the configured LLM provider
- Commands are shown before execution for review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

MIT License - see LICENSE file for details

## 🐛 Issues

Report issues at: [Issues](https://github.com/cmdgenie/cmdgenie/issues)
Email(pranavubarhande.business@gmail.com): [Gmail](mailto:pranavubarhande.business@gmail.com)
GitHub(https://github.com/pranavubarhande): [GitHub](https://github.com/pranavubarhande)

## 🔄 Changelog

### v1.0.0
- Initial release
- Support for OpenAI, Anthropic, Google, and Cohere
- Cross-platform compatibility
- Interactive command execution