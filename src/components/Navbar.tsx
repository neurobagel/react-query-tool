import { useState } from 'react';
import {
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Avatar,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import GitHub from '@mui/icons-material/GitHub';
import Article from '@mui/icons-material/Article';
import Logout from '@mui/icons-material/Logout';
import Login from '@mui/icons-material/Login';
import { useAuth0 } from '@auth0/auth0-react';
import logo from '../assets/logo.png';
import packageJson from '../../package.json';
import { enableAuth } from '../utils/constants';
import { Notification } from '../utils/types';

function Navbar({
  isLoggedIn,
  onLogin,
  notifications,
  setNotifications,
}: {
  isLoggedIn: boolean;
  onLogin: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openAccountMenu = Boolean(anchorEl);

  const { user, logout } = useAuth0();
  const [anchorNotifEl, setAnchorNotifEl] = useState<null | HTMLElement>(null);
  const openNotifMenu = Boolean(anchorNotifEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorNotifEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setAnchorNotifEl(null);
  };
  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };
  return (
    <Toolbar className="my-4" data-cy="navbar">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="Logo" height="60" />
          <div className="ml-4">
            <Badge badgeContent={packageJson.version || 'beta'}>
              <Typography variant="h5">Neurobagel Query</Typography>
            </Badge>
            <Typography className="text-gray-500">
              Define and find cohorts at the subject level
            </Typography>
          </div>
        </div>
        <div className="flex">
          <Tooltip title="Documentation">
            <IconButton
              size="small"
              href="https://neurobagel.org/user_guide/query_tool/"
              target="_blank"
            >
              <Article />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton onClick={handleNotifClick}>
              <Badge badgeContent={notifications.length} color="primary">
                <NotificationsIcon color="action" />
              </Badge>
            </IconButton>
          </Tooltip>
          <Popover
            open={openNotifMenu}
            anchorEl={anchorNotifEl}
            onClose={handleNotifClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <div className="max-h-96 w-72 overflow-auto rounded-lg border border-gray-300 bg-white shadow-md">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2">
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'bold',
                    color: '#333',
                  }}
                >
                  Notifications
                </Typography>
                <Button
                  size="small"
                  color="secondary"
                  onClick={clearAllNotifications}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#f50057',
                      color: '#fff',
                    },
                  }}
                >
                  Clear All
                </Button>
              </div>
              <List>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <ListItem
                      key={notification.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <ListItemText
                        primary={notification.type.toUpperCase()}
                        secondary={notification.message}
                        primaryTypographyProps={{
                          style: {
                            color: notification.type === 'warning' ? '#FFA726' : '#2196F3',
                            fontWeight: 'bold',
                          },
                        }}
                        secondaryTypographyProps={{
                          style: {
                            fontSize: '0.85rem',
                            color: '#666',
                          },
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => removeNotification(notification.id)}
                          sx={{
                            color: '#888',
                            '&:hover': {
                              color: '#000',
                            },
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No notifications"
                      primaryTypographyProps={{
                        style: { textAlign: 'center', fontStyle: 'italic', color: '#888' },
                      }}
                    />
                  </ListItem>
                )}
              </List>
            </div>
          </Popover>

          <IconButton href="https://github.com/neurobagel/query-tool/" target="_blank">
            <GitHub />
          </IconButton>

          {enableAuth && (
            <>
              <IconButton onClick={handleClick}>
                <Avatar
                  src={user?.picture ?? ''}
                  sx={{ width: 30, height: 30 }}
                  alt={user?.name ?? ''}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={openAccountMenu}
                onClose={handleClose}
                onClick={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MenuItem>
                    <Avatar src={user?.picture ?? ''} alt={user?.name ?? ''} />
                  </MenuItem>
                </div>
                {isLoggedIn ? (
                  <>
                    <MenuItem>
                      <Typography>Logged in as {user?.name ?? ''}</Typography>
                    </MenuItem>
                    <MenuItem
                      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    >
                      <ListItemIcon className="mr-[-8px]">
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </>
                ) : (
                  <MenuItem onClick={onLogin} data-cy="login-button">
                    <ListItemIcon className="mr-[-8px]">
                      <Login fontSize="small" />
                    </ListItemIcon>
                    Login
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </div>
      </div>
    </Toolbar>
  );
}

export default Navbar;
