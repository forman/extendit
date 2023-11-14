/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

interface ApiLinkProps {
  type?:
    | "classes "
    | "functions"
    | "interfaces"
    | "modules"
    | "types"
    | "variables";
  module?: string;
  name: string;
  text?: string;
}

const baseUrl = "https://forman.github.io/extendit";

export function ApiLink({ type, module, name, text }: ApiLinkProps) {
  const href = [
    baseUrl,
    type ?? "functions",
    `${module ?? "core"}.${name}.html`,
  ].join("/");
  return (
    <code>
      <a href={href} target="_blank">
        {text ?? name}
      </a>
    </code>
  );
}

export default ApiLink;
