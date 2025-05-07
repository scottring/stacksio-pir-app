# Stacksio PIR Workflow

A Product Information Request (PIR) workflow system built with React, TypeScript, and Firebase.

## Overview

Stacksio is an application designed to streamline the Product Information Request workflow. It manages the complete lifecycle of PIRs from creation to approval with the following states:

- Requested
- Submitted
- Reviewed
- Accepted

## Features

- Complete PIR lifecycle management
- Role-based access control
- Question and answer tracking
- Document attachments
- Email notifications
- Tagging system for organization

## Tech Stack

- React
- TypeScript
- Firebase (Firestore, Authentication, Cloud Functions, Storage)
- Zustand for state management
- Tailwind CSS for styling
- SendGrid for email notifications

## Architecture

The application follows a clean architecture pattern with separation of concerns:

- Types: Core type definitions
- Firebase Integration: Data access layer
- State Management: Application state using Zustand
- UI Components: React components for the user interface
- Firebase Functions: Backend logic for workflow automation and notifications
