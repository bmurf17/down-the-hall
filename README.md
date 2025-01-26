This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

Migration Example
npx drizzle-kit generate --name book_rating

High level diagram
graph TB
subgraph "Frontend Layer"
Pages["Pages"]:::frontend
UIComponents["UI Components"]:::frontend
ClientActions["Client Actions"]:::frontend

        subgraph "Pages Components"
            Home["Home Page"]:::frontend
            BookDetails["Book Details"]:::frontend
            Track["Track Page"]:::frontend
            Find["Find Page"]:::frontend
            Goals["Goals Page"]:::frontend
            Stats["Stats Page"]:::frontend
        end

        subgraph "UI Components"
            BasicUI["Basic UI"]:::frontend
            BookDetailsUI["Book Details UI"]:::frontend
            TrackUI["Track UI"]:::frontend
            GoalsUI["Goals UI"]:::frontend
            StatsUI["Stats UI"]:::frontend
            Nav["Navigation"]:::frontend
        end

        subgraph "Client Actions"
            BookAct["Book Actions"]:::frontend
            GoalsAct["Goals Actions"]:::frontend
            ExtAPIAct["External API Actions"]:::frontend
        end
    end

    subgraph "API Layer"
        BooksAPI["Books API"]:::api
        GoalsAPI["Goals API"]:::api
        StatsAPI["Stats API"]:::api
        UserActivityAPI["User Activity API"]:::api
    end

    subgraph "External APIs"
        GoogleBooks["Google Books API"]:::external
        OpenLibrary["OpenLibrary API"]:::external
        Hardcover["Hardcover API"]:::external
    end

    subgraph "Database Layer"
        DB[(SQL Database)]:::database
        Schema["Schema"]:::database
        Migrations["Migrations"]:::database
    end

    subgraph "Authentication Layer"
        FirebaseAuth["Firebase Auth"]:::auth
        UserMgmt["User Management"]:::auth
    end

    subgraph "Utils Layer"
        CoreUtils["Core Utils"]:::utils
        Helpers["Helpers"]:::utils
        Types["Type Definitions"]:::utils
    end

    %% Relationships
    Pages --> UIComponents
    UIComponents --> ClientActions
    ClientActions --> BooksAPI
    ClientActions --> GoalsAPI
    ClientActions --> StatsAPI
    ClientActions --> UserActivityAPI
    ClientActions --> ExtAPIAct
    ExtAPIAct --> GoogleBooks
    ExtAPIAct --> OpenLibrary
    ExtAPIAct --> Hardcover
    BooksAPI --> DB
    GoalsAPI --> DB
    StatsAPI --> DB
    UserActivityAPI --> DB
    DB --> Schema
    Schema --> Migrations
    FirebaseAuth --> UserMgmt
    UserMgmt --> Pages

    %% Click Events
    click Pages "https://github.com/bmurf17/down-the-hall/tree/master/app"
    click Home "https://github.com/bmurf17/down-the-hall/blob/master/app/page.tsx"
    click BookDetails "https://github.com/bmurf17/down-the-hall/blob/master/app/book/[bookId]/page.tsx"
    click Track "https://github.com/bmurf17/down-the-hall/blob/master/app/track/page.tsx"
    click Find "https://github.com/bmurf17/down-the-hall/blob/master/app/find/page.tsx"
    click Goals "https://github.com/bmurf17/down-the-hall/blob/master/app/goals/page.tsx"
    click Stats "https://github.com/bmurf17/down-the-hall/blob/master/app/stats/page.tsx"
    click UIComponents "https://github.com/bmurf17/down-the-hall/tree/master/components"
    click BasicUI "https://github.com/bmurf17/down-the-hall/tree/master/components/basicUI"
    click BookDetailsUI "https://github.com/bmurf17/down-the-hall/tree/master/components/bookDetails"
    click TrackUI "https://github.com/bmurf17/down-the-hall/tree/master/components/track"
    click GoalsUI "https://github.com/bmurf17/down-the-hall/tree/master/components/goals"
    click StatsUI "https://github.com/bmurf17/down-the-hall/tree/master/components/stats"
    click Nav "https://github.com/bmurf17/down-the-hall/tree/master/components/nav"
    click BookAct "https://github.com/bmurf17/down-the-hall/blob/master/actions/bookActions.ts"
    click GoalsAct "https://github.com/bmurf17/down-the-hall/blob/master/actions/goalsActions.ts"
    click ExtAPIAct "https://github.com/bmurf17/down-the-hall/blob/master/actions/googleBookActions.ts"
    click BooksAPI "https://github.com/bmurf17/down-the-hall/tree/master/app/api/books"
    click GoalsAPI "https://github.com/bmurf17/down-the-hall/tree/master/app/api/goals"
    click StatsAPI "https://github.com/bmurf17/down-the-hall/tree/master/app/api/stats"
    click UserActivityAPI "https://github.com/bmurf17/down-the-hall/tree/master/app/api/useractivitylog"
    click Schema "https://github.com/bmurf17/down-the-hall/blob/master/lib/schema.ts"
    click FirebaseAuth "https://github.com/bmurf17/down-the-hall/blob/master/lib/firebase-config.ts"
    click UserMgmt "https://github.com/bmurf17/down-the-hall/blob/master/components/UserManagement.tsx"
    click CoreUtils "https://github.com/bmurf17/down-the-hall/blob/master/lib/utils.ts"
    click Types "https://github.com/bmurf17/down-the-hall/tree/master/types"
    click Migrations "https://github.com/bmurf17/down-the-hall/tree/master/drizzle"

    %% Styles
    classDef frontend fill:#3498db,stroke:#2980b9,color:white
    classDef api fill:#2ecc71,stroke:#27ae60,color:white
    classDef external fill:#f1c40f,stroke:#f39c12,color:black
    classDef database fill:#9b59b6,stroke:#8e44ad,color:white
    classDef auth fill:#e74c3c,stroke:#c0392b,color:white
    classDef utils fill:#95a5a6,stroke:#7f8c8d,color:white
