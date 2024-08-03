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

const SPOONACULAR_API_KEY = "074a45a2489e444bab35e496e5d8e140";

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
    console.log(inventoryList);
  };

  const clearInventory = async () => {
    const itemsRef = collection(firestore, "inventory");
    const items = await getDocs(itemsRef);

    for (const item of items.docs) {
      await deleteDoc(doc(firestore, "inventory", item.id));
    }

    await updateInventory();
  };

  const addItems = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity, imageUrl } = docSnap.data();
      await setDoc(
        docRef,
        { quantity: quantity + 1, imageUrl },
        { merge: true }
      );
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const removeItems = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity, imageUrl } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(
          docRef,
          { quantity: quantity - 1, imageUrl },
          { merge: true }
        );
      }
    }

    await updateInventory();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const imageRef = ref(
      storage,
      `inventory_images/${currentItem.name + v4()}`
    );
    await uploadBytes(imageRef, file);
    const imageUrl = await getDownloadURL(imageRef);

    const docRef = doc(collection(firestore, "inventory"), currentItem.name);
    await setDoc(docRef, { imageUrl }, { merge: true });

    await updateInventory();
  };

  const handleUploadClick = (item) => {
    setCurrentItem(item);
    document.getElementById(`fileInput-${item.name}`).click();
  };

  const handleSelectItem = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleGenerateRecipes = async () => {
    setLoading(true);
    try {
      const ingredients = selectedItems.join(",+");
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=5&apiKey=${SPOONACULAR_API_KEY}`
      );
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container>
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ transform: "translate(-50%, -50%)" }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItems(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Container>
        <Typography
          variant="h3"
          letterSpacing={5}
          paddingTop="200px"
          paddingLeft={30}
          paddingRight={30}
          paddingBottom={10}
        >
          Inventory Management
        </Typography>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ marginBottom: "20px" }}
        />
      </Container>
      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Box
          display="flex"
          justifyContent="center"
          padding={2}
          marginBottom={10}
        >
          <Button variant="outlined" onClick={() => handleOpen()}>
            Add New Item
          </Button>
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          padding={2}
          marginBottom={10}
        >
          <Button variant="outlined" onClick={clearInventory}>
            Clear Inventory
          </Button>
        </Box>
      </Box>
      <Container>
        <Grid container>
          {filteredInventory.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.name}>
              <Card>
                <CardContent>
                  <Box
                    display={"flex"}
                    flexDirection={"column"}
                    alignItems={"center"}
                    gap={3}
                  >
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
                    >
                      Upload Image
                    </Button>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} width="100%" />
                    )}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedItems.includes(item.name)}
                          onChange={() => handleSelectItem(item.name)}
                        />
                      }
                      label="Select"
                    />
                    <Typography variant="h5" textTransform={"capitalize"}>
                      {item.name}
                    </Typography>
                    <Typography variant="h9">
                      Quantity: {item.quantity}
                    </Typography>
                    <Box
                      display={"flex"}
                      flexDirection={"row"}
                      justifyContent={"center"}
                      gap={3}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => addItems(item.name)}
                      >
                        Add
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
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
        <Box mt={4}>
          {recipes.map((recipe) => (
            <Card key={recipe.id} sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="h6">{recipe.title}</Typography>
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  style={{ width: "100%" }}
                />
                <Typography>Used Ingredients:</Typography>
                <ul>
                  {recipe.usedIngredients.map((ingredient) => (
                    <li key={ingredient.id}>{ingredient.name}</li>
                  ))}
                </ul>
                <Typography>Missed Ingredients:</Typography>
                <ul>
                  {recipe.missedIngredients.map((ingredient) => (
                    <li key={ingredient.id}>{ingredient.name}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Container>
  );
}
