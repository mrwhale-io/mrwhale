import { codeBlock } from "./markdown-helpers";

interface Field {
  name: string;
  value: string;
}

export class InfoBuilder {
  private fields: Field[] = [];

  addField(name: string, value: string): this {
    return this.addFields({ name, value });
  }

  addFields(...fields: Field[]): this {
    this.fields.push(...fields);

    return this;
  }

  build(): string {
    const output = this.fields
      .map((field) => `${field.name}: ${field.value}`)
      .join("\n");

    return codeBlock(output);
  }

  toString(): string {
    return this.build();
  }
}
