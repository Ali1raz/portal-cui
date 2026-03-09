import "@testing-library/jest-dom/vitest";

import { config } from "dotenv";
config({ path: ".env" }); // or process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
