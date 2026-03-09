import { describe, it, expect } from "vitest";
import { updateProfileSchema } from "@/app/(user)/profile/schema";

describe("Profile Schemas", () => {
  describe("updateProfileSchema", () => {
    it("validates correct profile updates", () => {
      const validData = {
        name: "Jane Doe",
        imageKey: "some-s3-key.jpg",
      };
      expect(updateProfileSchema.safeParse(validData).success).toBe(true);
    });

    it("allows omitting the optional imageKey", () => {
      const validData = {
        name: "Jane Doe",
      };
      expect(updateProfileSchema.safeParse(validData).success).toBe(true);
    });

    it("rejects names shorter than 3 characters", () => {
      const invalidData = {
        name: "Jo",
      };
      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Name must be 3 chars long."
        );
      }
    });

    it("rejects names longer than 20 characters", () => {
      const invalidData = {
        name: "ThisNameIsWayTooLongForAUserProfile",
      };
      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Name must be less than 20 chars."
        );
      }
    });
  });
});
