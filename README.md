# react-zod-saver 🛡️

A **type-safe LocalStorage manager for React** powered by **Zod**.

`react-zod-saver` provides a simple React hook that works like `useState`, but automatically
syncs with `localStorage`, validates data using Zod schemas, synchronizes across browser
tabs, and safely migrates stored data when your app evolves.

---

## 🚀 What Is This Package?

### Type-Safe LocalStorage Manager

Managing `localStorage` in React often involves:

- Manual `JSON.parse` / `JSON.stringify`
- Defensive `try/catch` blocks
- `useEffect` synchronization
- No schema validation
- Broken apps when stored data is corrupted

### 💡 The Idea

`react-zod-saver` is a **hook-based storage library** that keeps React state and browser storage
in sync **with full schema validation**.

You define:
- A Zod schema
- A storage key
- A default value

The library guarantees:
- Safe parsing & validation
- Cross-tab reactivity
- Type inference
- Versioned data migrations

---

## ✨ Features

- ✅ **Schema Validation** — Prevent crashes from corrupted storage data
- 🔄 **Cross-Tab Sync** — State updates instantly across tabs
- 🚀 **Version Migrations** — Upgrade old data safely
- 🏗️ **Type Inference** — Types inferred from Zod schemas
- 🍃 **Lightweight** — Zero-config, React 18+ friendly

---

## 📦 Installation

```bash
npm install react-zod-saver zod

```
## ⚡ Quick Start

The `useSafeStorage` hook works just like `useState`, but with storage + validation built in.

```ts
import { z } from 'zod';
import { useSafeStorage } from 'zod-persist';

const UserSchema = z.object({
  name: z.string(),
  theme: z.enum(['light', 'dark']),
});

function App() {
  const [user, setUser] = useSafeStorage({
    key: 'user-settings',
    schema: UserSchema,
    defaultValue: { name: 'Guest', theme: 'light' },
  });

  return (
    <div>
      <h1>Hello, {user.name}</h1>

      <button
        onClick={() =>
          setUser({
            ...user,
            theme: user.theme === 'light' ? 'dark' : 'light',
          })
        }
      >
        Toggle Theme (Current: {user.theme})
      </button>
    </div>
  );
}
 