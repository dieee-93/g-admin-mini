# Cash Core (Internal) (`/modules/cash`)

## Overview
**INTERNAL CORE LIBRARY** for the Cash Management system. This directory contains the business logic, services, types, and handlers that power the `cash-management` module.

> **Note**: For the public module manifest and hooks, see [`/modules/cash-management`](../cash-management/README.md).

## Structure
- `services/`: Core business logic (CashSessionService, etc.).
- `handlers/`: Event handlers for cross-module communication.
- `types/`: TypeScript definitions for cash entities.
- `init.ts`: Initialization logic for the core subsystem.
