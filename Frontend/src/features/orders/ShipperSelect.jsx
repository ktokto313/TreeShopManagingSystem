import { useEffect } from 'react';
import { Select } from '../../components/ui/Select';
import useFetchAllShippers from './hooks/useFetchAllShippers';

/**
 * A select dropdown for picking a shipper for an order.
 * Fetches the shipper list from /api/users?role=SHIPPER on mount.
 *
 * @param {{ value: string|number, onChange: (shipperId: string) => void, disabled?: boolean }} props
 */
export default function ShipperSelect({ value, onChange, disabled = false }) {
    const { shippers, isLoading, error, fetchShippers } = useFetchAllShippers();

    useEffect(() => {
        fetchShippers();
    }, []);

    const options = [
        { value: '', label: isLoading ? 'Loading shippers...' : 'Unassigned' },
        ...shippers.map((shipper) => ({
            value: shipper.id,
            label: shipper.fullName || shipper.username || `Shipper #${shipper.id}`,
        })),
    ];

    return (
        <Select
            label="Assign Shipper"
            options={options}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoading}
            error={error && error !== 'UNAUTHORIZED' ? 'Failed to load shippers' : undefined}
        />
    );
}
