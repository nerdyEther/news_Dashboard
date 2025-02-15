# NewsFlow: News and Payout Management Dashboard



##  Features

### 1. Authentication
- Secure login system
- Protected dashboard routes

### 2. News Dashboard
- Aggregate news from multiple sources


### 3. Advanced Filtering
- Search across articles
- Filter by author
- Content type selection (News/Blogs)
- Date range filtering

### 4. Payout Analytics
- Track author contributions
- Visualize earnings
- Customizable payout rates
- Export capabilities (CSV/PDF)

### 5. Responsive Design
- Full mobile and desktop support
- Dark mode implementation
- Adaptive UI components

## Tech Stack

- **Frontend**: Next.js 14
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Charts**: Recharts
- **UI Components**: Shadcn/ui
- **Animation**: Framer Motion


## Installation

1. Clone the repository
```bash
git clone https://github.com/nerdyEther/news_Dashboard.git
cd news_Dashboard
```

2. Install dependencies
```bash
npm install

```

3. Set up environment variables
Create a `.env.local` file in the root directory with:
```
NEXT_PUBLIC_NEWS_API_KEY=news_api_key
```

4. Run the development server
```bash
npm run dev

```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Credentials

- **Email**: demo@example.com
- **Password**: demo123

## Dark Mode

The application supports a full dark mode experience:
- System-level theme detection
- Manual theme switching
- Consistent dark mode styling across all components

##  API Integrations

- NewsAPI for news articles
- Dev.to API for blog posts



##  Responsive Design

Fully responsive layout that works seamlessly on:
- Desktop
- Mobile devices

## Performance Optimization
- Memoization techniques
- Efficient state management (Context API)



