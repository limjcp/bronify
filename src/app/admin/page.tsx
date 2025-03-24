"use client";
import { useState, ChangeEvent, FormEvent, useRef } from "react";
import { Upload, X, Music, Image } from "lucide-react";

export default function Admin() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create an object URL for audio preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      // Clean up previous object URL to avoid memory leaks
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setThumbnail(selectedFile);

      // Create a preview for the thumbnail
      const objectUrl = URL.createObjectURL(selectedFile);
      setThumbnailPreview(objectUrl);

      // Clean up previous object URL to avoid memory leaks
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  };

  const handleClickFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleClickThumbnailInput = () => {
    thumbnailInputRef.current?.click();
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setMessage("Please provide both a title and a song file.");
      setStatus("error");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist || "Unknown Artist");
    formData.append("file", file);
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Response status:", response.status, "data:", result);

      if (response.ok) {
        setMessage("Upload successful!");
        setStatus("success");
        // Reset form after successful upload
        setTitle("");
        setArtist("");
        setFile(null);
        setPreviewUrl(null);
        setThumbnail(null);
        setThumbnailPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
      } else {
        setMessage(`Upload failed: ${result.error || "Unknown error"}`);
        setStatus("error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed: Network error");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Upload Song
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Add new tracks to your Bronify collection
        </p>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Song title"
              />
            </div>

            {/* Artist Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Artist
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Artist name (optional)"
              />
            </div>

            {/* Audio File Dropzone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Song File
              </label>
              <div
                onClick={handleClickFileInput}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  file
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-600 hover:border-pink-500 hover:bg-pink-500/5"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Music className="text-green-500" size={20} />
                      <span className="text-sm truncate max-w-xs">
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="mx-auto h-12 w-12 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">
                      Click to select or drag and drop an audio file
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP3, WAV, OGG up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Audio preview */}
              {previewUrl && (
                <div className="mt-2">
                  <audio controls className="w-full h-10 mt-2">
                    <source src={previewUrl} type={file?.type} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>

            {/* Thumbnail Dropzone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Cover Art (optional)
              </label>
              <div
                onClick={handleClickThumbnailInput}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  thumbnail
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-600 hover:border-pink-500 hover:bg-pink-500/5"
                }`}
              >
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />

                {thumbnail ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Image className="text-green-500" size={20} />
                      <span className="text-sm truncate max-w-xs">
                        {thumbnail.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearThumbnail();
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Image className="mx-auto h-12 w-12 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">
                      Click to select or drag and drop a cover image
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, GIF up to 2MB
                    </p>
                  </div>
                )}
              </div>

              {/* Thumbnail preview */}
              {thumbnailPreview && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-24 w-24 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "loading"}
              className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                status === "loading"
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              }`}
            >
              {status === "loading" ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>Upload Song</>
              )}
            </button>
          </form>

          {/* Status Message */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                status === "success"
                  ? "bg-green-800/50 text-green-200"
                  : status === "error"
                  ? "bg-red-800/50 text-red-200"
                  : ""
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
