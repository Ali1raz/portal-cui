import { describe, it, expect } from "vitest";
import { subjectSchema } from "@/app/(admin)/admin/schema";

describe("Admin Schemas", () => {
  describe("subjectSchema", () => {
    it("validates correct subject data", () => {
      const validData = {
        name: "Software Engineering",
        code: "SWE-101",
        creditHours: 3,
      };
      expect(subjectSchema.safeParse(validData).success).toBe(true);
    });

    it("rejects credit hours less than 1", () => {
      const invalidData = {
        name: "Seminar",
        code: "SEM-001",
        creditHours: 0,
      };
      const result = subjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects credit hours greater than 4", () => {
      const invalidData = {
        name: "Heavy Course",
        code: "HC-101",
        creditHours: 5,
      };
      const result = subjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects empty strings for name and code", () => {
      const invalidData = { name: "", code: "", creditHours: 3 };
      expect(subjectSchema.safeParse(invalidData).success).toBe(false);
    });
  });
});
