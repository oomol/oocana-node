import { describe, expect, it } from "vitest";
import { generateCredentialInput, replaceCredential } from "../src/credential";
import { HandlesDef } from "@oomol/oocana-types";
import { CredentialInput } from "@oomol/oocana-sdk";

describe("credential", () => {
  describe("generateCredentialInput", () => {
    it("should parse valid three-part credential path", () => {
      const result = generateCredentialInput(
        "${{OO_CREDENTIAL:github,token,my-token}}"
      );
      expect(result).toEqual(
        new CredentialInput("github", "token", "my-token")
      );
    });

    it("should parse credential path with special characters", () => {
      const result = generateCredentialInput(
        "${{OO_CREDENTIAL:api,my-key,secret123}}"
      );
      expect(result).toEqual(new CredentialInput("api", "my-key", "secret123"));
    });

    it("should return null for invalid format", () => {
      expect(generateCredentialInput("invalid")).toBeNull();
      expect(
        generateCredentialInput("${{OO_SECRET:type,name,key}}")
      ).toBeNull();
      expect(generateCredentialInput("${{OO_CREDENTIAL:}}")).toBeNull();
      expect(
        generateCredentialInput("${{OO_CREDENTIAL:only-type}}")
      ).toBeNull();
      expect(
        generateCredentialInput("${{OO_CREDENTIAL:github,my-token}}")
      ).toBeNull(); // Two parts should be null
    });

    it("should return null for too many parts", () => {
      expect(
        generateCredentialInput(
          "${{OO_CREDENTIAL:github,token,my-token,extra}}"
        )
      ).toBeNull();
    });

    it("should return null for empty parts", () => {
      expect(generateCredentialInput("${{OO_CREDENTIAL:,,}}")).toBeNull();
      expect(
        generateCredentialInput("${{OO_CREDENTIAL:github,,my-token}}")
      ).toBeNull();
      expect(
        generateCredentialInput("${{OO_CREDENTIAL:,token,my-token}}")
      ).toBeNull();
    });
  });

  describe("replaceCredential", () => {
    it("should replace credential inputs", () => {
      const inputs = {
        token: "${{OO_CREDENTIAL:github,auth-token,my-token}}",
        regular: "normal value",
      };

      const inputsDef: HandlesDef = {
        token: {
          handle: "token",
          json_schema: {
            type: "string",
            contentMediaType: "oomol/credential",
          },
        },
        regular: {
          handle: "regular",
          json_schema: {
            type: "string",
          },
        },
      };

      const result = replaceCredential(inputs, inputsDef);

      expect(result.token).toEqual(
        new CredentialInput("github", "auth-token", "my-token")
      );
      expect(result.regular).toBe("normal value");
    });

    it("should not replace when handle is not credential type", () => {
      const inputs = {
        secret: "${{OO_CREDENTIAL:github,auth-token,my-token}}",
      };

      const inputsDef: HandlesDef = {
        secret: {
          handle: "secret",
          json_schema: {
            type: "string",
            contentMediaType: "oomol/secret",
          },
        },
      };

      const result = replaceCredential(inputs, inputsDef);
      expect(result.secret).toBe(
        "${{OO_CREDENTIAL:github,auth-token,my-token}}"
      );
    });

    it("should not replace invalid credential format", () => {
      const inputs = {
        token: "${{OO_CREDENTIAL:github,my-token}}",
      };

      const inputsDef: HandlesDef = {
        token: {
          handle: "token",
          json_schema: {
            type: "string",
            contentMediaType: "oomol/credential",
          },
        },
      };

      const result = replaceCredential(inputs, inputsDef);
      expect(result.token).toBe("${{OO_CREDENTIAL:github,my-token}}");
    });

    it("should handle non-object inputs", () => {
      expect(replaceCredential("string", {})).toBe("string");
      expect(replaceCredential(null, {})).toBeNull();
      expect(replaceCredential(123, {})).toBe(123);
    });
  });
});
