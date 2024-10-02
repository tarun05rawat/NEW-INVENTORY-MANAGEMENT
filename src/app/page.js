"use client";
import { useState, useEffect } from "react";
import { firestore, storage } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import axios from "axios";
import {
  Box,
  Modal,
  Stack,
  TextField,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import {
  query,
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";

const NEXT_PUBLIC_SPOONACULAR_API_KEY = "074a45a2489e444bab35e496e5d8e140";
export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container
      sx={{
        background: "linear-gradient(to right, #1e3c72, #2a5298)",
        minHeight: "100vh",
        paddingTop: "50px",
        paddingBottom: "50px",
      }}
    >
      <Typography
        variant="h3"
        align="center"
        color="white"
        gutterBottom
        sx={{ fontWeight: "bold", letterSpacing: "3px", textShadow: "1px 1px 2px black" }}
      >
        StockSmart
      </Typography>
      <TextField
        variant="outlined"
        fullWidth
        placeholder="Search items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          marginBottom: "20px",
          backgroundColor: "#fff",
          borderRadius: "5px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      />
      <Box display="flex" justifyContent="center" mb={4}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#5c67f2",
            color: "#fff",
            margin: "0 10px",
            "&:hover": {
              backgroundColor: "#424bf2",
            },
          }}
          onClick={() => setOpen(true)}
        >
          Add New Item
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#ff5f5f",
            color: "#fff",
            margin: "0 10px",
            "&:hover": {
              backgroundColor: "#f24444",
            },
          }}
          onClick={clearInventory}
        >
          Clear Inventory
        </Button>
      </Box>
      <Grid container spacing={4}>
        {filteredInventory.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.name}>
            <Card
              sx={{
                borderRadius: "15px",
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
                backgroundColor: "#f4f4f9",
              }}
            >
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <input
                    type="file"
                    id={`fileInput-${item.name}`}
                    style={{ display: "none" }}
                    accept="image/*"
                    capture="camera"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => handleUploadClick(item)}
                    sx={{
                      backgroundColor: "#5c67f2",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#424bf2" },
                    }}
                  >
                    Upload Image
                  </Button>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{
                        width: "100%",
                        borderRadius: "10px",
                        marginTop: "10px",
                      }}
                    />
                  )}
                  <Typography variant="h5" sx={{ textTransform: "capitalize", marginTop: "10px" }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2">Quantity: {item.quantity}</Typography>
                  <Box mt={2} display="flex" gap={2}>
                    <Button variant="contained" onClick={() => addItems(item.name)}>
                      Add
                    </Button>
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: "#ff5f5f", "&:hover": { backgroundColor: "#f24444" } }}
                      onClick={() => removeItems(item.name)}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateRecipes}
          disabled={selectedItems.length === 0}
        >
          Generate Recipes
        </Button>
      </Box>
      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}
