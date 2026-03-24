# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**PyF26** is a web implementation of "Punto y Fama" (Bulls and Cows), a classic pencil-and-paper number guessing game.

## Game Rules

- The machine generates a secret 4-digit number with all unique digits at the start of each game.
- The player has 10 attempts to guess the secret number.
- Each guess must be a 4-digit number with all unique digits.
- After each guess, the result is a string of `F` and `.`:
  - `F` — correct digit in the correct position (a "Fama")
  - `.` — correct digit in the wrong position (a "Punto")
  - `F`s always appear before `.`s in the result string (order does not reveal digit positions)
- Example: Secret `1234`, guess `4259` → result `"F."` (digit `2` is in position, digit `4` is present but wrong position)
- The game ends when the secret number is fully guessed (`FFFF`) or the player exhausts all attempts.

## Core Game Logic — `pyf.js`

The `pyf` class encapsulates all game logic:

| Method | Description |
|--------|-------------|
| `constructor(maxDigitos)` | Generates a random secret number with `maxDigitos` unique digits |
| `checkNumber(value)` | Returns the result string (`F`s and `.`s) for a given guess |
| `validInput(value)` | Returns `true` if the input has the correct length and no repeated digits |
| `getSecretNumber()` | Returns the secret number (for debugging/reveal) |

## Project Goals

- Rewrite using **TypeScript** and a modern web GUI framework (TBD)
- Fast, responsive UI that works on both **desktop and mobile** browsers without loss of functionality
- The root URL (`/`) goes directly into play mode — no landing page

## Build & Test

No build tooling or test framework has been set up yet. Tooling is TBD.
