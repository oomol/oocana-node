import { describe, expect, it } from "vitest";
import { CredentialInput, generateCredentialInput, replaceCredential } from "../src/credential";
import { HandlesDef } from "@oomol/oocana-types";

describe("credential", () => {
  describe("generateCredentialInput", () => {
    it("should parse valid credential path", () => {
      const result = generateCredentialInput("${{OO_CREDENTIAL:github,my-token}}");
      expect(result).toEqual(new CredentialInput("github", "my-token"));
    });

    it("should parse credential path with comma in id", () => {
      const result = generateCredentialInput("${{OO_CREDENTIAL:api,token,with,comma}}");
      expect(result).toEqual(new CredentialInput("api", "token,with,comma"));
    });

    it("should return null for invalid format", () => {
      expect(generateCredentialInput("invalid")).toBeNull();
      expect(generateCredentialInput("${{OO_SECRET:type,name,key}}")).toBeNull();
      expect(generateCredentialInput("${{OO_CREDENTIAL:}}")).toBeNull();
      expect(generateCredentialInput("${{OO_CREDENTIAL:only-type}}")).toBeNull();
    });
  });

  describe("replaceCredential", () => {
    it("should replace credential inputs", () => {
      const inputs = {
        token: "${{OO_CREDENTIAL:github,my-token}}",
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

      expect(result.token).toEqual(new CredentialInput("github", "my-token"));
      expect(result.regular).toBe("normal value");
    });

    it("should not replace when handle is not credential type", () => {
      const inputs = {
        secret: "${{OO_CREDENTIAL:github,my-token}}",
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
      expect(result.secret).toBe("${{OO_CREDENTIAL:github,my-token}}");
    });

    it("should handle non-object inputs", () => {
      expect(replaceCredential("string", {})).toBe("string");
      expect(replaceCredential(null, {})).toBeNull();
      expect(replaceCredential(123, {})).toBe(123);
    });
  });
});