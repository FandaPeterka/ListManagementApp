'use client';

/**
 * `ProfilePictureSection`:
 * - Displays the user's profile picture and allows them to upload and edit a new one.
 * - Provides a cropping interface using `react-easy-crop` for precise editing.
 * - Integrates with `UserAccountContext` to update the profile picture.
 * - Uses a modal (`CustomModal`) to display the cropping tool.
 * - Features zoom and cropping functionalities with adjustable parameters.
 * - Ensures changes are saved as a circular image and updates the UI dynamically.
 */

import React, { useState, useCallback } from 'react';
import { useUserAccount } from '@/context/UserAccountContext';
import { useTranslation } from 'react-i18next';
import { MdCameraAlt, MdSave, MdClose } from 'react-icons/md';
import CustomModal from '../CustomModal';
import Cropper from 'react-easy-crop';
import Slider from '@mui/material/Slider';
import { BASE_URL } from '@/constants/api';

const ProfilePictureSection = () => {
  const { userDetails, updateProfilePicture } = useUserAccount();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setImageSrc(null);
    setCroppedAreaPixels(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result));
      reader.readAsDataURL(file);
    });
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const diameter = Math.min(croppedAreaPixels.width, croppedAreaPixels.height);
    canvas.width = diameter;
    canvas.height = diameter;

    ctx.beginPath();
    ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      diameter,
      diameter,
      0,
      0,
      diameter,
      diameter
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleSave = async () => {
    if (imageSrc && croppedAreaPixels) {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedImageFile = new File([croppedImageBlob], 'cropped.jpg', {
        type: 'image/jpeg',
      });
      await updateProfilePicture(croppedImageFile);
    }
    handleCloseModal();
  };

  return (
    <div className="profile-picture-section">
      <div className="profile-picture-container">
        <img
          src={
            userDetails.profilePicture
              ? `${BASE_URL}${userDetails.profilePicture}?t=${new Date().getTime()}`
              : '/default-profile.png'
          }
          alt="Profile"
          className="profile-picture"
        />
        <button
          onClick={handleOpenModal}
          className="edit-icon-button"
          title={t('edit_profile_picture')}
        >
          <MdCameraAlt size={24} />
        </button>
      </div>

      <CustomModal isOpen={isModalOpen} onClose={handleCloseModal} title={t('edit_profile_picture')}>
        {!imageSrc ? (
          <input type="file" accept="image/*" onChange={handleFileChange} className="file-input" />
        ) : (
          <>
            <div className="cropper-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="slider-container">
              <Slider
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e, newZoom) => setZoom(newZoom)}
              />
            </div>
            <div className="button-group">
              <button
                onClick={handleSave}
                className="save-button"
              >
                <MdSave size={20} /> {t('save')}
              </button>
              <button
                onClick={handleCloseModal}
                className="cancel-button"
              >
                <MdClose size={20} /> {t('cancel')}
              </button>
            </div>
          </>
        )}
      </CustomModal>
    </div>
  );
};

export default ProfilePictureSection;