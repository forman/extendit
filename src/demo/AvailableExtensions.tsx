import availableExtensions from "./extensions";
import {
    getExtensionDisplayName,
    getExtensionId,
    useExtensions,
    registerExtension
} from "@/core";

function AvailableExtensions() {
    const extensions = useExtensions();

    function hasExtension(id: string) {
        return Boolean(extensions.find(e => e.id === id))
    }

    return (
        <div className="row2-item">
            <h1>Available Extensions</h1>
            <p>Click to install</p>
            <div className="button-bar">
                {
                    availableExtensions.map(manifest => {
                        return (
                            <button
                                key={getExtensionId(manifest)}
                                disabled={hasExtension(getExtensionId(manifest))}
                                onClick={() => registerExtension(manifest)}
                                type="button"
                            >
                                {getExtensionDisplayName(manifest)}
                            </button>
                        );
                    })
                }
            </div>
        </div>
    );
}

export default AvailableExtensions;
