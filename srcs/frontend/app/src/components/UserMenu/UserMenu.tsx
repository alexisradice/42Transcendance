import { Menu } from '@mantine/core';

type Props = {
  children: JSX.Element;
};

const UserMenu = ({ children }: Props) => {
  return (
    <Menu shadow='md' width={150}>
      <Menu.Target>
        {children}
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item>Settings</Menu.Item>
        <Menu.Item>Stats</Menu.Item>
        <Menu.Item>Log out</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
