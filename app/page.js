'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { Box, Typography, Button, Modal, CircularProgress, Snackbar, Alert, Grid, Container, AppBar, Toolbar, IconButton, Switch, Menu, MenuItem, CssBaseline } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { firestore, auth } from '../app/firebase';
import { doc, collection, setDoc, getDoc, deleteDoc, getDocs, query } from 'firebase/firestore';
import Auth from './Auth';
import ItemForm from './ItemForm';
import ItemTable from './ItemTable';
import '@tensorflow/tfjs'; // Import TensorFlow.js
import * as mobilenet from '@tensorflow-models/mobilenet'; // Import MobileNet model
import Link from 'next/link';
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [groceryList, setGroceryList] = useState([]);
  const [open, setOpen] = useState(false);
  const [isAddingToPantry, setIsAddingToPantry] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [success, setSuccess] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null); // For storing prediction
  const videoRef = useRef(null); // Reference for the video element

  const theme = useTheme();
  const appliedTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  useEffect(() => {
    if (user) {
      updateInventory();
    }
  }, [user]);
  const handleSignOut = async () => {
    try {
        await signOut(auth);
        setUser(null);
        console.log('User signed out successfully');
    } catch (error) {
        console.error("Failed to sign out: ", error);
        setError("Failed to sign out. Please try again.");
    }
};
  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const updateInventory = async () => {
    setLoading(true);
    try {
      const snapshot = query(collection(firestore, `users/${user.uid}/inventory`));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() });
      });
      console.log("Inventory List: ", inventoryList);
      setInventory(inventoryList);
    } catch (error) {
      console.error("Failed to update inventory: ", error);
      setError("Error updating inventory. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  const addGroceryItem = (item) => {
    console.log("Adding grocery item: ", item);
    if (!item || item.name.trim() === "") {
      setError("Item name cannot be empty.");
      return;
    }

    if (groceryList.find(groceryItem => groceryItem.name.toLowerCase() === item.name.toLowerCase())) {
      setError("Item already exists in the grocery list.");
      return;
    }

    setGroceryList([...groceryList, item]);
    setSuccess("Grocery item added successfully!");
  };

  const removeGroceryItem = (index) => {
    const newGroceryList = [...groceryList];
    newGroceryList.splice(index, 1);
    setGroceryList(newGroceryList);
    setSuccess("Grocery item removed successfully!");
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
function CameraCapture({ open, onClose, handleImageCapture }) {
  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const startCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsCameraOpen(true); // Set to true when the camera starts
        })
        .catch((error) => {
          console.error("Error accessing camera: ", error);
        });
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return; // Ensure the video reference is valid

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const capturedImage = canvas.toDataURL('image/png');
    handleImageCapture(capturedImage);
    onClose();
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraOpen(false); // Set to false when the camera stops
    }
  };

  return (
    <Box sx={{ ...modalStyle, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Capture Image
      </Typography>
      <video ref={videoRef} style={{ width: '100%', height: 'auto' }} />
      <Box mt={2}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={captureImage} 
          disabled={!isCameraOpen} // Enable the button only when the camera is open
        >
          Capture
        </Button>
      </Box>
      {!isCameraOpen && (
        <Box mt={2}>
          <Button variant="contained" onClick={startCamera}>
            Start Camera
          </Button>
        </Box>
      )}
    </Box>
  );
}
const deleteItem = async (index) => {
  const itemToDelete = inventory[index];

  try {
    // Delete from Firestore
    const docRef = doc(firestore, `users/${user.uid}/inventory`, itemToDelete.name);
    await deleteDoc(docRef);

    // Update state
    const newInventory = [...inventory];
    newInventory.splice(index, 1);
    setInventory(newInventory);

    setSuccess("Item deleted successfully!");
  } catch (error) {
    console.error("Failed to delete item: ", error);
    setError("Error deleting item. Please try again later.");
  }
};

const addItem = async (item) => {
  if (!item || item.name.trim() === "") {
    setError("Item name cannot be empty.");
    return;
  }

  if (item.quantity <= 0) {
    setError("Quantity must be greater than 0.");
    return;
  }

  if (inventory.find(invItem => invItem.name.toLowerCase() === item.name.toLowerCase())) {
    setError("Item already exists in the inventory.");
    return;
  }

  try {
    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item.name);
    await setDoc(docRef, { quantity: item.quantity });
    await updateInventory();
    setSuccess("Item added successfully!");
  } catch (error) {
    console.error("Failed to add item: ", error);
    setError("Error adding item. Please try again later.");
  }
};

const removeItem = async (name) => {
  try {
    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await deleteDoc(docRef);
      await updateInventory();
      setSuccess("Item removed successfully!");
    }
  } catch (error) {
    console.error('Failed to remove item:', error);
    setError('Error removing item. Please try again later.');
  }
};

const increaseQuantity = async (name) => {
  try {
    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
      await updateInventory();
      setSuccess("Quantity increased successfully!");
    }
  } catch (error) {
    console.error('Failed to increase quantity:', error);
    setError('Error increasing quantity. Please try again later.');
  }
};

const decreaseQuantity = async (name) => {
  try {
    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity > 1) {
        await setDoc(docRef, { quantity: quantity - 1 });
      } else {
        await deleteDoc(docRef);
      }
      await updateInventory();
      setSuccess("Quantity decreased successfully!");
    }
  } catch (error) {
    console.error('Failed to decrease quantity:', error);
    setError('Error decreasing quantity. Please try again later.');
  }
};

const handleOpen = (addToPantry) => {
  setIsAddingToPantry(addToPantry);
  setOpen(true);
};

const handleClose = () => setOpen(false);
const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
const handleMenuClose = () => setAnchorEl(null);

const handleAddItem = (item) => {
  console.log("Adding item: ", item, " to ", isAddingToPantry ? "Pantry" : "Grocery List");
  if (isAddingToPantry) {
    addItem(item);
  } else {
    addGroceryItem(item);
  }
  handleClose();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    classifyImage(imageUrl);  // Use the image for classification
  }
};

const classifyImage = async (imageUrl) => {
  const model = await mobilenet.load();
  const imgElement = new Image();
  imgElement.src = imageUrl;
  imgElement.onload = async () => {
    const predictions = await model.classify(imgElement);
    setPrediction(predictions[0]);
    addItemToPantry(predictions[0].className);
  };
};

const addItemToPantry = (itemName) => {
  console.log(`Adding ${itemName} to the pantry.`);
  const newItem = { name: itemName, quantity: 1 };
  addItem(newItem); // Add to the inventory
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
          <IconButton color="inherit" onClick={handleSignOut} disabled={!user}>
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

        <Grid container spacing={2}>
  <Grid item xs={12}>
    <Typography variant="h5" gutterBottom align="center">
      Items in Your Pantry
    </Typography>
    <Box
      sx={{
        border: '1px solid #333',
        borderRadius: 2,
        padding: 2,
        height: '300px',  // Set a fixed height
        overflowY: 'auto', // Enable scrolling
      }}
    >
      <ItemTable
        items={inventory}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        updateItem={updateItem}
        deleteItem={deleteItem}
      />
    </Box>
  </Grid>

  <Grid item xs={12}>
    <Typography variant="h5" gutterBottom align="center">
      Grocery List
    </Typography>
    <Box
      sx={{
        border: '1px solid #333',
        borderRadius: 2,
        padding: 2,
        height: '300px',  // Set a fixed height
        overflowY: 'auto', // Enable scrolling
      }}
    >
      <ItemTable
        items={groceryList}
        deleteItem={removeGroceryItem}
        updateItem={(index, updatedItem) => {
          const newGroceryList = [...groceryList];
          newGroceryList[index] = updatedItem;
          setGroceryList(newGroceryList);
        }}
      />
    </Box>
  </Grid>
</Grid>

          <Grid item xs={12}>
  <Button 
    variant="contained" 
    onClick={() => handleOpen(true)} 
    fullWidth 
    startIcon={<AddIcon />}
  >
    ADD NEW ITEM TO PANTRY
  </Button>
</Grid>

<Grid item xs={12}>
  <Button 
    variant="contained" 
    onClick={() => handleOpen(false)} 
    fullWidth 
    startIcon={<ShoppingCartIcon />}
  >
    ADD NEW ITEM TO GROCERY LIST
  </Button>
</Grid>

<Grid item xs={12}>
  <Button 
    variant="contained" 
    color="secondary" 
    fullWidth 
    onClick={() => setCameraOpen(true)} 
    startIcon={<CameraAltIcon />}
  >
    USE CAMERA TO ADD ITEM
  </Button>
</Grid>


        <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>

        <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Box sx={modalStyle}>
            <ItemForm addItem={addItem} addGroceryItem={addGroceryItem} isPantry={isAddingToPantry} />
          </Box>
        </Modal>
        <Modal open={cameraOpen} onClose={() => setCameraOpen(false)} aria-labelledby="camera-modal-title" aria-describedby="camera-modal-description">
  <CameraCapture
    open={cameraOpen}
    onClose={() => setCameraOpen(false)}
    handleImageCapture={(capturedImage) => {
      setImage(capturedImage);
      classifyImage(capturedImage);
    }}
  />
</Modal>

      </Container>
    </Box>
  </ThemeProvider>
);
}
