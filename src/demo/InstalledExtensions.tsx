import {useMemo} from "react";
import {
    activateExtension,
    type Extension,
    getExtensionDisplayName,
    useExtensions
} from "@/core";


function sortExtensions(extensions: Extension[]): Extension[] {
    return extensions.sort(
        (e1, e2) =>
            getExtensionDisplayName(e1.manifest).localeCompare(
                getExtensionDisplayName(e2.manifest)
            )
    );
}

function InstalledExtensions() {
    const extensions = useExtensions();
    const sortedExtensions = useMemo(
        () => sortExtensions(extensions),
        [extensions]
    );

    const canActivateExtension = (extension: Extension) =>
        extension.status === "inactive"
        || extension.status === "rejected";

    return (
        <div className="row2-item">
            <h1>Installed Extensions</h1>
            <p>Will be auto-activated when you click a command below.
                Click to activate manually:</p>
            <div className="button-bar">
                {
                    sortedExtensions.map(extension => {
                        return (
                            <button
                                key={extension.id}
                                disabled={!canActivateExtension(extension)}
                                style={{color: extension.status === "rejected" ? "red" : undefined}}
                                onClick={() => activateExtension(extension.id)}
                                type="button"
                            >
                                {getExtensionDisplayName(extension.manifest)}
                            </button>
                        );
                    })
                }
            </div>
        </div>
    );
}

export default InstalledExtensions;
