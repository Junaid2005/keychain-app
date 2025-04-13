"use client"

import { SetStateAction, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { getAudioCatalogue } from '@/services/audio-catalogue'
import Link from 'next/link'
import PhantomWalletIntegration from '@/components/wallet'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import HeaderBar from '@/components/header-bar'
import ThemeImage from '@/components/logo'
import HeaderLink from '@/components/header-links'
import { ThemeToggle } from '@/components/theme-toggle'


export default function CataloguePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const leftHeaderLinks = [
    {href: 'chat', text: 'Chat'},
    {href: 'copyright', text: 'Copyright Checker'},
    {href: 'catalogue', text: 'Catalogue', underline: true},
  ] 

  const itemsPerPage = 12

  const audioItems = getAudioCatalogue()

  const filteredItems = audioItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem)

  const handleSearchChange = (userInput: { target: { value: SetStateAction<string> } }) => {
    setSearchQuery(userInput.target.value)
    setCurrentPage(1) // Reset to the first page on search change
  }

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage)
  }

  return (
    <div className="min-h-screen p-16">
      <HeaderBar leftItems={[
        <ThemeImage key="themeLogo" />, // Your theme image component
        ...leftHeaderLinks.map((link, index) => (
          <HeaderLink
            key={index} // Add a unique key
            href={link.href}
            text={link.text}
            underline={link.underline}
          />
        ))
      ]} rightItems={[<ThemeToggle key="themeToggle"/>]} />

      {/* Search Bar */}
      <div className="flex justify-center items-center mb-8 space-x-4 mt-4">
        <Input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search the blockchain catalogue..."
          className="px-4 py-2 border rounded-lg w-1/4 text-lg focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <Button className="flex items-center space-x-1 py-3 rounded-lg hover:bg-brand-foreground">
          <ArrowUpTrayIcon className="h-5 w-5" />
          <span>Upload</span>
        </Button>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {currentItems.map((item) => (
          <Card
            key={item.id}
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={500}           // Define width and height for Next.js Image optimization
              height={500}          // Define width and height for Next.js Image optimization ITS DODGY
              className="w-full h-48"
            />
            <div className="p-4">
              <Label className="text-xl font-semibold">{item.title}</Label>
              <Label className="text-gray-800 dark:text-gray-400">{item.artist}</Label>
              <Button
                onClick={() => alert(`Play ${item.title}`)} // Replace with actual play functionality
                className="mt-4 w-full px-4 py-2"
              >
                Play
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination Section */}
      <div className="flex justify-center mt-8">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Prev
        </Button>
        <Label className="mx-4 text-s">
          Page {currentPage} of {Math.ceil(filteredItems.length / itemsPerPage)}
        </Label>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage)}
          className="px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  )
}