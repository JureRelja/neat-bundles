import "./toogleSwitch.css";

export default function ToggleSwitch({ label, labelHidden = true, onChange }: { labelHidden: boolean; label: string; onChange: () => unknown }) {
    return (
        <div className="container">
            <div className="toggle-switch">
                <input type="checkbox" className="checkbox" name={label} id={label} onChange={onChange} />
                <label className="label" htmlFor={label}>
                    <span className="inner" />
                    <span className="switch" />
                </label>
            </div>
        </div>
    );
}
