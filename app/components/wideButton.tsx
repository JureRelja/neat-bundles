import { Button } from '@shopify/polaris';

{
    /*  */
}

export default function Index({ onClick }: { onClick: () => void }) {
    return (
        <div style={{ width: '200px' }}>
            {/* Save button */}
            <Button
                fullWidth
                variant="primary"
                onClick={() => {
                    onClick();
                }}>
                Next
            </Button>
        </div>
    );
}
