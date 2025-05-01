# ProxyWave

![ProxyWave Logo](generated-icon.png)

ProxyWave is a lightweight, privacy-focused web proxy service that allows you to browse the internet anonymously through an intermediary server.

## Features

- **Anonymous Web Browsing**: Access websites through our secure proxy server to hide your IP address and protect your identity
- **Content Filtering**: Block ads, trackers, scripts, images, and popups for a cleaner, safer browsing experience
- **Privacy Controls**: Enhanced privacy with incognito mode and Tor routing simulation
- **Cross-Browser Compatibility**: Works on all major browsers without requiring any installation
- **Minimalist Design**: Clean, simple interface focused on functionality

## Privacy Features

ProxyWave takes your privacy seriously with these advanced features:

- **Content Filtering**: Block unwanted content including:
  - Advertisements
  - Tracking scripts
  - Pop-ups
  - Images
  - Scripts

- **Incognito Mode**: Browse without storing cookies or history
  
- **Tor Routing Simulation**: Route your traffic with privacy-enhancing headers

## Technical Implementation

ProxyWave is built with modern web technologies:

- **Frontend**: React with TypeScript, TailwindCSS, and shadcn/ui components
- **Backend**: Express.js server for handling proxy requests
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Analytics**: Privacy-focused analytics dashboard for understanding usage patterns

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/proxywave.git
cd proxywave
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with the following:
```
DATABASE_URL=postgresql://username:password@localhost:5432/proxywave
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## Usage

1. Enter the URL you want to visit in the input field
2. Configure your privacy and content filter settings as desired
3. Click "Go" to browse through the proxy

## Analytics

ProxyWave includes a privacy-focused analytics dashboard that tracks:

- Total requests
- Unique URLs visited
- Average response time
- Success rate
- Device breakdown (mobile vs. desktop)

All analytics are anonymized and used only to improve service performance.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Copyright

© 2025 ProxyWave. All rights reserved.