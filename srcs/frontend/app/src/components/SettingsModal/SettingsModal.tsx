import { Modal, TextInput } from '@mantine/core';

type Props = {
  opened: boolean;
  close: () => void;
}

const SettingsModal = ({ opened, close }: Props) => {
  return (
    <Modal radius="md" centered={true} opened={opened} onClose={close} title="Settings" overlayProps={{
      backgroundOpacity: 0.55,
      blur: 3,
    }}>
      <div>
        <TextInput description="Change your username" size="md" radius="md" placeholder="lmurtin" />
      </div>
    </Modal>
  );
};

export default SettingsModal;
