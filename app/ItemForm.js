import React, { useState } from 'react';
import { Grid, TextField, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function ItemForm({ addItem, addGroceryItem, isPantry }) {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = () => {
    if (itemName.trim() && quantity > 0) {
      const item = { name: itemName, quantity: parseInt(quantity, 10) };
      if (isPantry) {
        addItem(item);
      } else {
        addGroceryItem(item);
      }
      setItemName('');
      setQuantity(1);
    } else {
      alert("Please enter a valid item name and quantity greater than 0");
    }
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12}>
        <Typography variant="h5">Add Items</Typography>
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Item name"
          variant="outlined"
          fullWidth
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          inputProps={{ 'aria-label': 'item name' }}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label="Quantity"
          variant="outlined"
          type="number"
          fullWidth
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          inputProps={{ 'aria-label': 'quantity', min: 1 }}
        />
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
        >
          {isPantry ? 'ADD TO PANTRY' : 'ADD TO GROCERY LIST'}
        </Button>
      </Grid>
    </Grid>
  );
}

ItemForm.propTypes = {
  addItem: PropTypes.func.isRequired,
  addGroceryItem: PropTypes.func.isRequired,
  isPantry: PropTypes.bool.isRequired,
};
