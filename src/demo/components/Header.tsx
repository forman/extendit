/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

function Header() {
  return (
    <>
      <h1>ExtendIt.js Demo</h1>
      <p>
        This is a simple React application that demonstrates how extensions are
        installed, activated, and how they can contribute to an application.
        Contributions may be anything. Here they are <em>commands</em>,{" "}
        <em>menus</em>, and <em>views</em>. Commands are named JS functions,
        menus contains menu items that refer to commands, and views are React
        components. The &quot;Show X&quot; commands select a given given view,
        while the &quot;Print X&quot; commands output a message to the Developer
        Tools console (press <span className="keybinding">CTRL SHIFT I</span> to
        open).
      </p>
    </>
  );
}

export default Header;
