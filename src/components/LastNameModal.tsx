import Modal from './Modal'
import SurnameForm from './SurnameForm'

/** The last-name modal opened from the header. */
export default function LastNameModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Set last name" titleId="last-name-title" onClose={onClose}>
      {(close) => (
        <SurnameForm
          onSaved={(persisted) => {
            if (persisted) close()
          }}
          onClose={close}
        />
      )}
    </Modal>
  )
}
