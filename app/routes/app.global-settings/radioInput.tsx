import { Button, Text } from '@shopify/polaris';
import styles from './route.module.css';

export default function Index({
    value,
    selectedValue,
    imgSrc,
    updateHandler,
    label,
    attributeKey,
}: {
    value: string;
    selectedValue: string;
    label: string;
    imgSrc: string;
    attributeKey: string;
    updateHandler: (attributeKey: string, value: string) => void;
}) {
    return (
        <>
            <input type="radio" id="sticky" name="displayMobileStepNavigation" value={value} hidden />
            <label htmlFor="displayMobileStepNavigation" aria-label="sticky">
                <div className={styles.divWithFlexCenterContent}>
                    <Text as="p" fontWeight="bold" variant="headingMd">
                        {label}
                    </Text>
                    <img src={imgSrc} alt="Sticky navigation" width={280} />
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
