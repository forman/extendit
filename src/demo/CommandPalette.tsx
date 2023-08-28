import { executeCommand } from "@/contrib";
import { useCommandPalette } from "@/contrib/command-palette";

function CommandPalette() {
  const menuItems = useCommandPalette();

  return (
    <div className="row2-item">
      <h1>Command Palette</h1>
      <p>
        Shows all available commands of the <code>commands</code> contribution
        point, except those removed by <code>when</code>-clauses in items of the{" "}
        <code>commandPalette</code> menu of the <code>menus</code>
        contribution point.
      </p>
      <div className="button-bar">
        {menuItems.map((menuItem) => (
          <button
            key={menuItem.id}
            onClick={() => {
              void executeCommand(menuItem.command);
            }}
            disabled={menuItem.disabled}
            type="button"
          >
            {menuItem.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CommandPalette;
