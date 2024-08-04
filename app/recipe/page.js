'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Checkbox, FormControlLabel, Stack, MenuItem, Select, FormControl, InputLabel, Paper } from '@mui/material';
import { getDocs, collection } from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { createTheme, ThemeProvider } from '@mui/material/styles';
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#43a047',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          textTransform: 'none',
        },
      },
    },
  },
});

export default function Recipe() {
  const [inventory, setInventory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [mealType, setMealType] = useState('dinner');
  const [difficulty, setDifficulty] = useState('easy');
  const [time, setTime] = useState('30 minutes');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        console.log("No user is signed in.");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      if (!user) return;

      const snapshot = await getDocs(collection(firestore, `users/${user.uid}/inventory`));
      const inventoryList = [];
      snapshot.forEach(doc => inventoryList.push({ name: doc.id, ...doc.data() }));
      setInventory(inventoryList);
    };

    fetchInventory();
  }, [user]);

  const handleCheckboxChange = (item) => {
    setSelectedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const generateRecipe = async () => {
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selectedItems,
          mealType,
          difficulty,
          time,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setRecipe(data.recipe);
    } catch (error) {
      console.error('Failed to generate recipe:', error);
      alert('Error generating recipe. Please try again later.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 4, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <Typography variant="h4" align="center" marginBottom={4} color="primary">
          Your Pantry
        </Typography>

        {/* Meal Options Section */}
        <Box display="flex" justifyContent="center" gap={2} marginBottom={4}>
          <FormControl variant="outlined" sx={{ minWidth: 160 }}>
            <InputLabel id="meal-type-label">Meal Type</InputLabel>
            <Select
              labelId="meal-type-label"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              label="Meal Type"
            >
              <MenuItem value="breakfast">Breakfast</MenuItem>
              <MenuItem value="lunch">Lunch</MenuItem>
              <MenuItem value="dinner">Dinner</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" sx={{ minWidth: 160 }}>
            <InputLabel id="difficulty-label">Difficulty</InputLabel>
            <Select
              labelId="difficulty-label"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              label="Difficulty"
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" sx={{ minWidth: 160 }}>
            <InputLabel id="time-label">Time</InputLabel>
            <Select
              labelId="time-label"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              label="Time"
            >
              <MenuItem value="15 minutes">15 minutes</MenuItem>
              <MenuItem value="30 minutes">30 minutes</MenuItem>
              <MenuItem value="60 minutes">60 minutes</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Ingredient List with Checkboxes */}
        <Box display="flex" flexDirection="column" alignItems="center" marginBottom={4}>
          <Stack spacing={2}>
            {inventory.map(item => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedItems.includes(item.name)}
                    onChange={() => handleCheckboxChange(item.name)}
                    color="primary"
                  />
                }
                label={`${item.name} (Quantity: ${item.quantity})`}
                key={item.name}
              />
            ))}
          </Stack>

          <Button variant="contained" onClick={generateRecipe} color="secondary" sx={{ mt: 3 }}>
            Generate Recipe
          </Button>
        </Box>

        {/* Display Generated Recipe */}
        {recipe && (
          <Paper elevation={4} sx={{ padding: 4, marginTop: 4, borderRadius: '15px', backgroundColor: '#ffffff' }}>
            <Box display="flex" alignItems="center" gap={2} marginBottom={2}>
              <RestaurantMenuIcon color="primary" fontSize="large" />
              <Typography variant="h5" color="secondary">
                Your Generated Recipe
              </Typography>
            </Box>
            <Typography sx={{ whiteSpace: 'pre-line', fontFamily: 'Monospace' }}>
              {recipe}
            </Typography>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
}
