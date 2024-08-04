import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

export default function ItemTable({ items, deleteItem, updateItem }) {
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState(1);

  const handleEditClick = (index, currentItem) => {
    setEditIndex(index);
    setEditName(currentItem.name);
    setEditQuantity(currentItem.quantity);
  };

  const handleSaveClick = (index) => {
    updateItem(index, { name: editName, quantity: editQuantity });
    setEditIndex(null);
  };

  const handleCancelClick = () => {
    setEditIndex(null);
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                {editIndex === index ? (
                  <TextField
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  item.name
                )}
              </TableCell>
              <TableCell>
                {editIndex === index ? (
                  <TextField
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(parseInt(e.target.value))}
                  />
                ) : (
                  item.quantity
                )}
              </TableCell>
              <TableCell>
                {editIndex === index ? (
                  <>
                    <IconButton onClick={() => handleSaveClick(index)}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton onClick={handleCancelClick}>
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton onClick={() => handleEditClick(index, item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => deleteItem(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
