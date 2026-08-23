import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Currency from '../models/Currency.js';
import Language from '../models/Language.js';
import Location from '../models/Location.js';
import PropertyCategory from '../models/PropertyCategory.js';
import Amenity from '../models/Amenity.js';
import Property from '../models/Property.js';
import SellerAgentAssignment from '../models/SellerAgentAssignment.js';

async function upsertUser({ fullName, email, password, role, status = 'ACTIVE' }) {
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        fullName,
        email,
        passwordHash,
        role,
        status,
        phone: '+91 98765 43210',
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return user;
}

async function upsertCurrency(code, name, symbol, countryCode, isDefault = false) {
  return Currency.findOneAndUpdate(
    { code },
    { $set: { code, name, symbol, countryCode, isDefault } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertLanguage(code, name, nativeName, isDefault = false) {
  return Language.findOneAndUpdate(
    { code },
    { $set: { code, name, nativeName, isDefault } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertLocation({ name, slug, type, parent = null, countryCode = '', latitude = null, longitude = null }) {
  return Location.findOneAndUpdate(
    { slug },
    {
      $set: {
        name,
        slug,
        type,
        parent,
        countryCode,
        latitude,
        longitude,
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertCategory({ name, slug, categoryGroup }) {
  return PropertyCategory.findOneAndUpdate(
    { slug },
    { $set: { name, slug, categoryGroup, isActive: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertAmenity({ name, slug, icon = '' }) {
  return Amenity.findOneAndUpdate(
    { slug },
    { $set: { name, slug, icon, isActive: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function main() {
  await connectDatabase();

  const indiaCurrency = await upsertCurrency('INR', 'Indian Rupee', '₹', 'IN', true);
  const usdCurrency = await upsertCurrency('USD', 'US Dollar', '$', 'US', false);
  const aedCurrency = await upsertCurrency('AED', 'UAE Dirham', 'د.إ', 'AE', false);

  await upsertLanguage('en', 'English', 'English', true);
  await upsertLanguage('hi', 'Hindi', 'हिन्दी', false);
  await upsertLanguage('ar', 'Arabic', 'العربية', false);

  const india = await upsertLocation({ name: 'India', slug: 'india', type: 'COUNTRY', countryCode: 'IN' });
  const delhi = await upsertLocation({ name: 'Delhi', slug: 'delhi', type: 'STATE', parent: india._id, countryCode: 'IN' });
  const gurgaon = await upsertLocation({ name: 'Gurugram', slug: 'gurugram', type: 'CITY', parent: delhi._id, countryCode: 'IN' });
  const noida = await upsertLocation({ name: 'Noida', slug: 'noida', type: 'CITY', parent: delhi._id, countryCode: 'IN' });
  const uae = await upsertLocation({ name: 'United Arab Emirates', slug: 'united-arab-emirates', type: 'COUNTRY', countryCode: 'AE' });
  const dubai = await upsertLocation({ name: 'Dubai', slug: 'dubai', type: 'CITY', parent: uae._id, countryCode: 'AE' });

  const apartmentCategory = await upsertCategory({ name: 'Apartment', slug: 'apartment', categoryGroup: 'RESIDENTIAL' });
  const villaCategory = await upsertCategory({ name: 'Villa', slug: 'villa', categoryGroup: 'RESIDENTIAL' });
  const officeCategory = await upsertCategory({ name: 'Office', slug: 'office', categoryGroup: 'COMMERCIAL' });

  const parkingAmenity = await upsertAmenity({ name: 'Parking', slug: 'parking', icon: 'car' });
  const gymAmenity = await upsertAmenity({ name: 'Gym', slug: 'gym', icon: 'dumbbell' });
  const poolAmenity = await upsertAmenity({ name: 'Swimming Pool', slug: 'swimming-pool', icon: 'waves' });

  const admin = await upsertUser({
    fullName: 'Platform Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  const agent = await upsertUser({
    fullName: 'Aarav Mehta',
    email: 'agent@example.com',
    password: 'Agent@123',
    role: 'AGENT',
    status: 'ACTIVE',
  });

  const seller = await upsertUser({
    fullName: 'Nisha Sharma',
    email: 'seller@example.com',
    password: 'Seller@123',
    role: 'SELLER',
    status: 'ACTIVE',
  });

  const customer = await upsertUser({
    fullName: 'Riya Verma',
    email: 'customer@example.com',
    password: 'Customer@123',
    role: 'CUSTOMER',
    status: 'ACTIVE',
  });

  await SellerAgentAssignment.findOneAndUpdate(
    { seller: seller._id },
    {
      $set: {
        seller: seller._id,
        agent: agent._id,
        primary: true,
        status: 'ACTIVE',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const properties = [
    {
      title: 'Luxury Villa in Gurugram',
      slug: 'luxury-villa-in-gurugram',
      description: 'A premium villa with landscaped gardens, private pool, and modern interiors in a high-demand residential enclave.',
      propertyType: villaCategory._id,
      listingType: 'SALE',
      status: 'PUBLISHED',
      price: 7800000,
      currency: indiaCurrency._id,
      negotiable: true,
      bedrooms: 4,
      bathrooms: 4,
      balconies: 3,
      area: 3200,
      areaUnit: 'sqft',
      furnished: true,
      parking: 3,
      facing: 'North',
      ownershipType: 'Freehold',
      amenities: [parkingAmenity._id, gymAmenity._id, poolAmenity._id],
      location: {
        country: india._id,
        state: delhi._id,
        city: gurgaon._id,
        address: 'Sector 58, Gurugram',
        postalCode: '122011',
        publicLocation: 'Gurugram, Haryana, India',
        exactAddress: 'Sector 58, Gurugram, Haryana',
      },
      owner: seller._id,
      agent: agent._id,
      seller: seller._id,
      approval: { status: 'APPROVED', reviewer: admin._id, reviewedAt: new Date(), notes: 'Approved for publication' },
      verified: true,
      publishedAt: new Date(),
      media: [{ url: 'https://images.unsplash.com/photo-1494526585095-c41746248156', fileName: 'villa.jpg', mimeType: 'image/jpeg', kind: 'IMAGE', isCover: true }],
      favoriteCount: 5,
      viewCount: 231,
    },
    {
      title: '3 BHK Apartment in Noida',
      slug: '3-bhk-apartment-in-noida',
      description: 'Bright 3-bedroom apartment with modern finishing, clubhouse access, and excellent connectivity to the metro corridor.',
      propertyType: apartmentCategory._id,
      listingType: 'SALE',
      status: 'PUBLISHED',
      price: 9800000,
      currency: indiaCurrency._id,
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      area: 1450,
      areaUnit: 'sqft',
      furnished: false,
      parking: 2,
      facing: 'East',
      ownershipType: 'Freehold',
      amenities: [parkingAmenity._id, gymAmenity._id],
      location: {
        country: india._id,
        state: delhi._id,
        city: noida._id,
        address: 'Sector 62, Noida',
        postalCode: '201301',
        publicLocation: 'Noida, Uttar Pradesh, India',
        exactAddress: 'Sector 62, Noida, Uttar Pradesh',
      },
      owner: seller._id,
      agent: agent._id,
      seller: seller._id,
      approval: { status: 'APPROVED', reviewer: admin._id, reviewedAt: new Date(), notes: 'Approved for publication' },
      verified: true,
      publishedAt: new Date(),
      media: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', fileName: 'apartment.jpg', mimeType: 'image/jpeg', kind: 'IMAGE', isCover: true }],
      favoriteCount: 14,
      viewCount: 410,
    },
    {
      title: 'Premium Office Space in Dubai Marina',
      slug: 'premium-office-space-in-dubai-marina',
      description: 'A premium office workspace in a high-traffic commercial district with enhanced business infrastructure and tenant amenities.',
      propertyType: officeCategory._id,
      listingType: 'RENT',
      status: 'PUBLISHED',
      price: 190000,
      currency: aedCurrency._id,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      area: 2100,
      areaUnit: 'sqft',
      furnished: true,
      parking: 2,
      facing: 'South',
      ownershipType: 'Leasehold',
      amenities: [parkingAmenity._id, gymAmenity._id],
      location: {
        country: uae._id,
        state: null,
        city: dubai._id,
        address: 'Dubai Marina, Dubai',
        postalCode: '00000',
        publicLocation: 'Dubai Marina, UAE',
        exactAddress: 'Dubai Marina, Dubai, UAE',
      },
      owner: seller._id,
      agent: agent._id,
      seller: seller._id,
      approval: { status: 'APPROVED', reviewer: admin._id, reviewedAt: new Date(), notes: 'Approved for publication' },
      verified: true,
      publishedAt: new Date(),
      media: [{ url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72', fileName: 'office.jpg', mimeType: 'image/jpeg', kind: 'IMAGE', isCover: true }],
      favoriteCount: 9,
      viewCount: 182,
    },
  ];

  for (const property of properties) {
    await Property.findOneAndUpdate(
      { slug: property.slug },
      { $set: property },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('Seed complete');
  console.log(JSON.stringify({
    admin: admin.email,
    agent: agent.email,
    seller: seller.email,
    customer: customer.email,
    currencies: [indiaCurrency.code, usdCurrency.code, aedCurrency.code],
    properties: properties.length,
  }, null, 2));

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
