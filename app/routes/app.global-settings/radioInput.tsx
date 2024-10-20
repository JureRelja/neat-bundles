import { Button, Text } from '@shopify/polaris';
import styles from './route.module.css';

export default function Index({
    value,
    selectedValue,
    imgSrc,
    updateHandler,
    label,
    attributeKey,
    horizontal,
}: {
    value: string;
    selectedValue: string;
    label: string;
    imgSrc: string;
    attributeKey: string;
    horizontal?: boolean;
    updateHandler: (attributeKey: string, value: string) => void;
}) {
    return (
        <>
            <input type="radio" id="sticky" name="displayMobileStepNavigation" defaultValue={value} hidden />
            <label htmlFor="displayMobileStepNavigation" aria-label="sticky">
                <div className={styles.divWithFlexCenterContent}>
                    <Text as="p" fontWeight="bold" variant="headingMd">
                        {label}
                    </Text>
                    <img src={imgSrc} alt="Sticky navigation" width={!horizontal ? 220 : 370} />
                    <Button
                        variant="primary"
                        disabled={selectedValue === value}
                        onClick={() => {
                            updateHandler(attributeKey, value);
                        }}>
                        {selectedValue !== value ? 'Select' : 'Selected'}
                    </Button>
                </div>
            </label>
        </>
    );
}
