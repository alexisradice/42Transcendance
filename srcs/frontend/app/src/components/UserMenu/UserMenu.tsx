import { Menu } from '@mantine/core';
import SettingsModal from '../SettingsModal/SettingsModal';
import { useDisclosure } from '@mantine/hooks';

type Props = {
  children: JSX.Element;
};

const UserMenu = ({ children }: Props) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <SettingsModal opened={opened} close={close} />
      <Menu shadow='md' width={150}>
        <Menu.Target>
          {children}
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={open}>Settings</Menu.Item>
          <Menu.Item>Stats</Menu.Item>
          <Menu.Item>Log out</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};

export default UserMenu;
