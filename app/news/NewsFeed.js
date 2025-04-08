"use client";

import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Spinner,
  useColorModeValue,
  Link,
  Button,
  IconButton,
  Flex
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import Sidebar from "../main/mainpage/Sidebar";
import RightPanel from "../main/mainpage/RightPanel";

const formatPublishedDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Check for invalid date
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date parsing error:', error);
    return '';
  }
};

export default function NewsFeed() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const shouldFetchNews = () => {
    const lastFetchTime = localStorage.getItem('lastNewsFetchTime');
    const cachedNews = localStorage.getItem('cachedNews');
    
    if (!lastFetchTime || !cachedNews) return true;

    const now = new Date();
    const last = new Date(parseInt(lastFetchTime));
    
    // Get current hour in 24-hour format
    const currentHour = now.getHours();
    
    // Check if it's a new day or if we've crossed 12pm
    if (now.getDate() !== last.getDate() || 
        (currentHour >= 12 && last.getHours() < 12) || 
        (currentHour >= 0 && currentHour < 12 && last.getHours() >= 12)) {
      return true;
    }
    
    return false;
  };

  const fetchNews = async (forceFetch = false) => {
    try {
      // Force fetch if requested
      if (!forceFetch && !shouldFetchNews()) {
        const cachedNews = localStorage.getItem('cachedNews');
        if (cachedNews) {
          setNews(JSON.parse(cachedNews));
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null); // Reset error state
      
      const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
      const url = `http://api.mediastack.com/v1/news?access_key=${apiKey}&languages=en&timestamp=${Date.now()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }
      
      if (data.data && Array.isArray(data.data)) {
        const uniqueNews = data.data.filter((article, index, self) =>
          index === self.findIndex((t) => (
            t.title === article.title && t.url === article.url
          ))
        );
        
        setNews(uniqueNews);
        localStorage.setItem('cachedNews', JSON.stringify(uniqueNews));
        localStorage.setItem('lastNewsFetchTime', Date.now().toString());
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      setError(err.message);
      const cachedNews = localStorage.getItem('cachedNews');
      if (cachedNews) {
        setNews(JSON.parse(cachedNews));
      }
    } finally {
      setLoading(false);
    }
  };

  const getNextFetchTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 0 && currentHour < 12) {
      // Next fetch at 12:00 PM today
      return new Date(now.setHours(12, 0, 0, 0));
    } else {
      // Next fetch at 12:00 AM tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return new Date(tomorrow.setHours(0, 0, 0, 0));
    }
  };

  useEffect(() => {
    fetchNews();

    // Set up next fetch schedule
    const now = new Date();
    const nextFetch = getNextFetchTime();
    const timeUntilNextFetch = nextFetch - now;

    const timer = setTimeout(() => {
      fetchNews();
    }, timeUntilNextFetch);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this runs once on mount

  // Modified loadMore to use cached data
  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
    // using the cached news data
  };

  // Add a function to display the next update time
  const getNextUpdateText = () => {
    const nextFetch = getNextFetchTime();
    return `Next update at ${nextFetch.toLocaleTimeString()} ${nextFetch.toLocaleDateString()}`;
  };

  // Add refresh handler
  const handleRefresh = () => {
    fetchNews(true); // Force fetch
  };

  return (
    <HStack h="100vh" spacing={0} align="stretch">
      <Sidebar />

      <Box
        flex="1"
        p={4}
        overflowY="auto"
        bg={useColorModeValue('gray.50', 'gray.900')}
        maxW="800px"
        mx="auto"
      >
        <Flex mb={4} justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold">Latest News</Text>
            <Text fontSize="sm" color="gray.500">{getNextUpdateText()}</Text>
          </Box>
          <IconButton
            icon={<RepeatIcon />}
            onClick={handleRefresh}
            isLoading={loading}
            aria-label="Refresh news"
            colorScheme="blue"
          />
        </Flex>

        {loading && news.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
            <Text mt={4}>Loading news...</Text>
          </Box>
        ) : error ? (
          <Box textAlign="center" py={8} color="red.500">
            {error}
          </Box>
        ) : news.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text>No news articles available</Text>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {news.map((article, index) => (
              <Box
                key={index}
                bg={useColorModeValue('white', 'gray.700')}
                p={4}
                borderRadius="lg"
                boxShadow="sm"
              >
                {article.image && (
                  <Image
                    src={article.image}
                    alt={article.title}
                    borderRadius="md"
                    mb={4}
                    fallbackSrc="https://via.placeholder.com/400x200"
                  />
                )}
                <Link
                  href={article.url}
                  isExternal
                  color={useColorModeValue('blue.600', 'blue.300')}
                >
                  <Text fontSize="xl" fontWeight="bold" mb={2}>
                    {article.title}
                  </Text>
                </Link>
                <Text color={useColorModeValue('gray.600', 'gray.300')} mb={2}>
                  {article.description}
                </Text>
                <HStack spacing={4} color={useColorModeValue('gray.500', 'gray.400')}>
                  <Text fontSize="sm">{article.author || 'Unknown Author'}</Text>
                  <Text fontSize="sm">{formatPublishedDate(article.published_at || article.published)}</Text>
                  <Text fontSize="sm">{article.category || 'Uncategorized'}</Text>
                </HStack>
              </Box>
            ))}
            
            <Button
              onClick={loadMore}
              isLoading={loading}
              colorScheme="blue"
              width="100%"
              mt={4}
            >
              Load More News
            </Button>
          </VStack>
        )}
      </Box>

      <RightPanel />
    </HStack>
  );
}








