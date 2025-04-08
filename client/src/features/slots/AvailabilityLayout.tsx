import { useAddSlotsMutation } from "./slotsSlice";

export const AvailabilityLayout = () => {
  const [ addSlots ] = useAddSlotsMutation();
  
  const slots = [
    {
      id: '6b8e4f3d-9a12-4e7b-a1c5-8f2d3e9b7c0a',
      employeeId: '92d5c8e1-f4b7-4d9e-8a3f-7c1e9b5d2a6f',
      type: 'AVAILAVLE' as 'AVAILABLE',
      startTime: new Date('2025-10-10'),
      duration: '00:30:00',
      recurring: false,
      createdAt: new Date('2025-10-10'),
      updatedAt: new Date('2025-10-10'),
    }
  ]

  return (
    <div>
      <button onClick={() => addSlots({ slots })}>
        Click me
      </button>
      Availability layout
    </div>
  )
}