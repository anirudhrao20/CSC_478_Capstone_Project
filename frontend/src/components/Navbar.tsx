import { Link } from 'react-router-dom';
import { 
  Navbar as NextUINavbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  Avatar, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Button 
} from '@nextui-org/react';
import { SunIcon, MoonIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { NavbarSearch } from './NavbarSearch';

export function Navbar() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarBrand>
        <Link to="/" className="font-bold text-inherit text-xl">
          Stock Portfolio
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <NavbarSearch />
        </NavbarItem>
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            onPress={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <SunIcon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
        </NavbarItem>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              name={user?.username}
              size="sm"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">{user?.email}</p>
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={logout}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </NextUINavbar>
  );
}
