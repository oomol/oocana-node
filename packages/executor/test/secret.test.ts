import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { replaceSecret, SECRET_PATH } from "../src/secret";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

const SECRET_VALUE = 'a\na"a';
const ORIGIN_VALUE = "Custom,aaa,AccessKey_ID";

const data = {
  aaa: {
    id: "019390cf-2a42-73dd-89ed-474ade0df7f5",
    secretName: "aaa",
    createdAt: 1733301316162,
    secretType: "Custom",
    secrets: [
      {
        secretKey: "AccessKey_ID",
        value: SECRET_VALUE,
      },
    ],
  },
};

describe("replace secret", () => {
  beforeAll(async () => {
    await mkdir(path.dirname(SECRET_PATH), {
      recursive: true,
    });

    await writeFile(SECRET_PATH, JSON.stringify(data));
  });

  afterAll(async () => {
    await unlink(SECRET_PATH);
  });

  it("replace root secret", async () => {
    const inputs = await replaceSecret(
      {
        s: ORIGIN_VALUE,
      },
      {
        s: {
          handle: "s",
          json_schema: {
            contentMediaType: "oomol/secret",
            type: "string",
          },
        },
      }
    );

    expect(inputs.s).not.eq(ORIGIN_VALUE);
    expect(inputs.s).eq(SECRET_VALUE);
  });

  it("secret fallback", async () => {
    const inputs = await replaceSecret(
      {
        s: "aaaaa",
      },
      {
        s: {
          handle: "s",
          json_schema: {
            contentMediaType: "oomol/secret",
            type: "string",
          },
        },
      }
    );

    expect(inputs.s).eq("aaaaa");
  });

  it("replace nested secret in object"),
    async () => {
      const inputs = await replaceSecret(
        {
          s: {
            a: ORIGIN_VALUE,
          },
        },
        {
          s: {
            handle: "s",
            json_schema: {
              type: "object",
              properties: {
                a: {
                  contentMediaType: "oomol/secret",
                  type: "string",
                },
              },
            },
          },
        }
      );

      expect(inputs.s.a).not.eq(ORIGIN_VALUE);
      expect(inputs.s.a).eq(SECRET_VALUE);
    };

  it("replace nest secret in array", async () => {
    const inputs = await replaceSecret(
      {
        s: [ORIGIN_VALUE],
      },
      {
        s: {
          handle: "s",
          json_schema: {
            type: "array",
            items: {
              contentMediaType: "oomol/secret",
              type: "string",
            },
          },
        },
      }
    );

    expect(inputs.s[0]).not.eq(ORIGIN_VALUE);
    expect(inputs.s[0]).eq(SECRET_VALUE);
  });

  it("replace OO_SECRET prefix string with oomol/secret", async () => {
    const OOMOL_SECRET = "${{OO_SECRET:" + ORIGIN_VALUE + "}}";
    const inputs = await replaceSecret(
      {
        s: OOMOL_SECRET,
      },
      {
        s: {
          handle: "s",
          json_schema: {
            type: "array",
            items: {
              contentMediaType: "oomol/secret",
              type: "string",
            },
          },
        },
      }
    );

    expect(inputs.s).not.eq(OOMOL_SECRET);
    expect(inputs.s).eq(SECRET_VALUE);
  });

  it("replace OO_SECRET prefix string", async () => {
    const OOMOL_SECRET = "${{OO_SECRET:" + ORIGIN_VALUE + "}}";
    const inputs = await replaceSecret(
      {
        s: OOMOL_SECRET,
      },
      {}
    );

    expect(inputs.s).not.eq(OOMOL_SECRET);
    expect(inputs.s).eq(SECRET_VALUE);
  });

  it("replace OO_SECRET prefix fallback", async () => {
    const OOMOL_SECRET = "${{OO_SECRET:" + ORIGIN_VALUE + "fal}}";
    const inputs = await replaceSecret(
      {
        s: OOMOL_SECRET,
      },
      {}
    );

    expect(inputs.s).eq(OOMOL_SECRET);
  });

  it("skip OO_SECRET prefix in other string", async () => {
    const value = "aaa${{OO_SECRET:" + ORIGIN_VALUE + "}}";
    const inputs = await replaceSecret(
      {
        s: {
          a: value,
        },
      },
      {}
    );

    expect(inputs.s.a).eq(value);
  });
});
