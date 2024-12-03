import { Button } from "@shopify/polaris";

{
    /*  */
}

export default function Index({ onClick, url }: { onClick: () => void; url?: string }) {
    return (
        <div style={{ width: "200px" }}>
            {/* Save button */}
            <Button
                fullWidth
                variant="primary"
                url={url}
                onClick={() => {
                    onClick();
                }}>
                Next
            </Button>
        </div>
    );
}
