'use client';

import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Typography, CircularProgress, Snackbar, Alert, AppBar, Toolbar, IconButton, Switch, CssBaseline, Menu, MenuItem } from '@mui/material';
import { signOut } from 'firebase/auth';
import { firestore, auth } from '../app/firebase';
import { collection, getDocs, query, doc, setDoc, deleteDoc } from 'firebase/firestore';
import Auth from './Auth';
import ItemTable from './ItemTable';
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (user) {
      updateInventory();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Failed to sign out: ", error);
    }
  };

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const updateInventory = async () => {
    setLoading(true);
    try {
      const snapshot = query(collection(firestore, `users/${user.uid}/inventory`));
      const docs = await getDocs(snapshot);
      const inventoryList = docs.docs.map(doc => ({ name: doc.id, ...doc.data() }));
      setInventory(inventoryList);
    } catch (error) {
      console.error("Failed to update inventory: ", error);
      setError("Error updating inventory. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (index, updatedItem) => {
    try {
      const itemRef = doc(firestore, `users/${user.uid}/inventory`, updatedItem.name);
      await setDoc(itemRef, { quantity: updatedItem.quantity }, { merge: true });

      const newInventory = [...inventory];
      newInventory[index] = updatedItem;
      setInventory(newInventory);
      setSuccess("Item updated successfully!");
    } catch (error) {
      console.error("Failed to update item: ", error);
      setError("Error updating item. Please try again later.");
    }
  };

  const deleteItem = async (index) => {
    try {
      const itemToDelete = inventory[index];
      const itemRef = doc(firestore, `users/${user.uid}/inventory`, itemToDelete.name);
      await deleteDoc(itemRef);

      const newInventory = [...inventory];
      newInventory.splice(index, 1);
      setInventory(newInventory);
      setSuccess("Item deleted successfully!");
    } catch (error) {
      console.error("Failed to delete item: ", error);
      setError("Error deleting item. Please try again later.");
    }
  };

  if (!user) return <Auth setUser={setUser} />;

  return (
    <ThemeProvider theme={appliedTheme}>
      <CssBaseline />
      <Box>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Pantry Manager
            </Typography>
            <Switch checked={darkMode} onChange={handleThemeChange} />
            <IconButton color="inherit" onClick={handleSignOut}>
              <LogoutIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose} component={Link} href="/recipe">
                Create a Recipe
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 5 }}>
          <Typography variant="h4" gutterBottom align="center">
            Welcome back, {user?.displayName || 'User'}!
          </Typography>

          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress size={50} />
              <Typography variant="h6" sx={{ ml: 2 }}>
                Loading inventory...
              </Typography>
            </Box>
          )}

          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
            <Alert onClose={() => setError(null)} severity="error">
              {error}
            </Alert>
          </Snackbar>

          <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
            <Alert onClose={() => setSuccess(null)} severity="success">
              {success}
            </Alert>
          </Snackbar>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom align="center">
                Items in Your Pantry
              </Typography>
              <Box border="1px solid #333" borderRadius={2} padding={2}>
                <ItemTable
                  items={inventory}
                  updateItem={updateItem}
                  deleteItem={deleteItem}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
