import AvailableExtensions from "./AvailableExtensions";
import InstalledExtensions from "./InstalledExtensions";
import CommandPalette from "./CommandPalette";
import ViewContainer from "./ViewContainer";
import MainMenu from "./MainMenu";

import "./App.css";

function App() {
    return (
        <>
            <div className="row2">
                <AvailableExtensions/>
                <InstalledExtensions/>
            </div>
            <div className="row2">
                <CommandPalette/>
                <MainMenu/>
            </div>
            <div className="row1">
                <ViewContainer/>
            </div>
        </>
    );
}

export default App;
