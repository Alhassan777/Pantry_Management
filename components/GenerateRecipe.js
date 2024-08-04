'use client';
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Checkbox, FormControlLabel, Stack, MenuItem, Select, FormControl, InputLabel, Paper } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const GenerateRecipe = ({
  inventory,
  selectedItems,
  setSelectedItems,
  generateRecipe,
  recipe,
  mealType,
  setMealType,
  difficulty,
  setDifficulty,
  time,
  setTime,
}) => {
  const handleCheckboxChange = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  return (
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
          {inventory.map((item) => (
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
  );
};

GenerateRecipe.propTypes = {
  inventory: PropTypes.array.isRequired,
  selectedItems: PropTypes.array.isRequired,
  setSelectedItems: PropTypes.func.isRequired,
  generateRecipe: PropTypes.func.isRequired,
  recipe: PropTypes.string,
  mealType: PropTypes.string.isRequired,
  setMealType: PropTypes.func.isRequired,
  difficulty: PropTypes.string.isRequired,
  setDifficulty: PropTypes.func.isRequired,
  time: PropTypes.string.isRequired,
  setTime: PropTypes.func.isRequired,
};

export default GenerateRecipe;
