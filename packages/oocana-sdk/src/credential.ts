import { CredentialInput as ICredentialInput } from "@oomol/oocana-types";

export class CredentialInput implements ICredentialInput {
  constructor(
    public readonly type: string,
    public readonly name: string,
    public readonly id: string
  ) {}
}
