import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, X, Minus, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAppContext } from './AppContext';
import { LEHMUHN_ADD_ONS, SIZE_LABELS, getAllowedSizesByStoreType } from '../config/menuRules';
import type {
  AddOnOption,
  CartItem,
  KohFeeMenuGroup,
  KohFeeSubGroup,
  LehMuhnDrinkType,
  Product,
  SizeOz,
} from '../types/menu';
import { getPriceForSize, products } from './data';
import { cn } from './ui/utils';

const LEHMUHN_TABS: LehMuhnDrinkType[] = ['HOT', 'COLD', 'BLENDED', 'SPARKLING'];
const KOHFEE_TABS: KohFeeMenuGroup[] = ['COLD', 'HOT', 'BLENDED', 'FOOD'];
const KOHFEE_SUBGROUPS: KohFeeSubGroup[] = ['COFFEE', 'NON_COFFEE'];

export function MenuPage() {
  const navigate = useNavigate();
  const { selectedBrand, cart, addToCart } = useAppContext();
  const [activeLehmuhnType, setActiveLehmuhnType] = useState<LehMuhnDrinkType>('COLD');
  const [activeKohfeeGroup, setActiveKohfeeGroup] = useState<KohFeeMenuGroup>('COLD');
  const [activeKohfeeSubGroup, setActiveKohfeeSubGroup] = useState<KohFeeSubGroup>('COFFEE');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const brandProducts = products.filter(p => p.storeId === selectedBrand);
  const isLehmuhn = selectedBrand === 'lehmuhn';

  const filteredProducts = brandProducts.filter(product => {
    if (product.storeId === 'lehmuhn') {
      const allowedDrinkTypes = product.allowedDrinkTypes ?? [product.drinkType];
      return allowedDrinkTypes.includes(activeLehmuhnType);
    }

    const allowedGroups = product.allowedMenuGroups ?? [product.menuGroup];
    if (!allowedGroups.includes(activeKohfeeGroup)) {
      return false;
    }

    if (activeKohfeeGroup === 'FOOD') {
      return true;
    }

    return product.subGroup === activeKohfeeSubGroup;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!selectedBrand) {
    return (
      <div className="px-4 pt-14 text-center">
        <p className="text-[#757575]">Select a store first to browse the menu.</p>
        <button onClick={() => navigate('/home')} className="text-[#00704A] mt-4 cursor-pointer">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="px-4 pt-10 pb-4 bg-white sticky top-0 z-10" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>Menu</h1>
            <p className="text-[13px] text-[#757575]">
              {selectedBrand === 'lehmuhn' ? 'Leh-muhn Juices & Tea' : 'Koh-fee'}
            </p>
          </div>
          <button onClick={() => navigate('/cart')} className="relative cursor-pointer p-2">
            <ShoppingCart size={24} color="#362415" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#D32F2F] text-white text-[11px] flex items-center justify-center"
                style={{ fontWeight: 600 }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {(isLehmuhn ? LEHMUHN_TABS : KOHFEE_TABS).map(cat => (
            <button
              key={cat}
              onClick={() => {
                if (isLehmuhn) {
                  setActiveLehmuhnType(cat as LehMuhnDrinkType);
                } else {
                  setActiveKohfeeGroup(cat as KohFeeMenuGroup);
                }
              }}
              className={`px-4 py-2 rounded-[20px] text-[13px] whitespace-nowrap cursor-pointer transition-all ${
                (isLehmuhn ? activeLehmuhnType : activeKohfeeGroup) === cat
                  ? 'bg-[#00704A] text-white'
                  : 'bg-[#F5F5F5] text-[#757575]'
              }`}
              style={{ fontWeight: (isLehmuhn ? activeLehmuhnType : activeKohfeeGroup) === cat ? 600 : 400 }}
            >
              {cat}
            </button>
          ))}
        </div>

        {!isLehmuhn && activeKohfeeGroup !== 'FOOD' && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
            {KOHFEE_SUBGROUPS.map(subGroup => (
              <button
                key={subGroup}
                onClick={() => setActiveKohfeeSubGroup(subGroup)}
                className={`px-3 py-1.5 rounded-[14px] text-[12px] whitespace-nowrap cursor-pointer transition-all ${
                  activeKohfeeSubGroup === subGroup
                    ? 'bg-[#362415] text-white'
                    : 'bg-[#F5F5F5] text-[#757575]'
                }`}
                style={{ fontWeight: activeKohfeeSubGroup === subGroup ? 600 : 400 }}
              >
                {subGroup === 'NON_COFFEE' ? 'NON-COFFEE' : subGroup}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="px-4 pt-4 pb-4 grid grid-cols-2 gap-3">
        {filteredProducts.map((product, i) => (
          <motion.button
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedProduct(product)}
            className="rounded-[16px] bg-white overflow-hidden text-left cursor-pointer"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <div className="h-[120px] overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              {product.isPremium && (
                <div className="inline-flex items-center gap-1 bg-[#362415] text-white text-[10px] px-2 py-1 rounded-[10px] mb-2">
                  <Sparkles size={11} />
                  <span style={{ fontWeight: 600 }}>Premium</span>
                </div>
              )}
              <h3 className="text-[14px] text-[#362415] line-clamp-1" style={{ fontWeight: 600 }}>{product.name}</h3>
              <p className="text-[12px] text-[#757575] mt-0.5 line-clamp-1">{product.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[15px] text-[#00704A]" style={{ fontWeight: 700 }}>
                  &#8369;{product.basePrice}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#00704A] flex items-center justify-center">
                  <Plus size={16} color="white" />
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Product Detail Bottom Sheet */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailSheet
            product={selectedProduct}
            activeLehmuhnType={activeLehmuhnType}
            activeKohfeeGroup={activeKohfeeGroup}
            activeKohfeeSubGroup={activeKohfeeSubGroup}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductDetailSheet({
  product,
  activeLehmuhnType,
  activeKohfeeGroup,
  activeKohfeeSubGroup,
  onClose,
  onAddToCart,
}: {
  product: Product;
  activeLehmuhnType: LehMuhnDrinkType;
  activeKohfeeGroup: KohFeeMenuGroup;
  activeKohfeeSubGroup: KohFeeSubGroup;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}) {
  const isLehmuhn = product.storeId === 'lehmuhn';
  const selectedType = isLehmuhn
    ? ((product.allowedDrinkTypes ?? [product.drinkType]).includes(activeLehmuhnType)
      ? activeLehmuhnType
      : product.drinkType)
    : undefined;
  const selectedGroup = !isLehmuhn
    ? ((product.allowedMenuGroups ?? [product.menuGroup]).includes(activeKohfeeGroup)
      ? activeKohfeeGroup
      : product.menuGroup)
    : undefined;
  const allowedSizes = getAllowedSizesByStoreType(
    product.storeId,
    isLehmuhn ? (selectedType as LehMuhnDrinkType) : (selectedGroup as KohFeeMenuGroup),
  );

  const [sizeOz, setSizeOz] = useState<SizeOz | undefined>(allowedSizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [toppingsRemoved, setToppingsRemoved] = useState(false);
  const [addOns, setAddOns] = useState<AddOnOption[]>([]);
  const [hotOption, setHotOption] = useState(isLehmuhn && product.hotOptions?.length ? product.hotOptions[0] : '');
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);

  const basePrice = getPriceForSize(product, sizeOz);
  const toppingsCost = toppingsRemoved ? 0 : (product.defaultToppingsCost ?? 0);
  const addOnsPrice = addOns.reduce((sum, addOn) => sum + addOn.extraCost, 0);
  const totalPrice = (basePrice + toppingsCost + addOnsPrice) * quantity;
  const fruitRule = isLehmuhn ? product.requiresFruitSelection : undefined;
  const fruitRequirementMet = !fruitRule || selectedFruits.length === fruitRule.min;

  const toggleAddOn = (option: AddOnOption) => {
    setAddOns(prev => (
      prev.some(existing => existing.id === option.id)
        ? prev.filter(existing => existing.id !== option.id)
        : [...prev, option]
    ));
  };

  const toggleFruit = (fruit: string) => {
    setSelectedFruits(prev => {
      if (prev.includes(fruit)) {
        return prev.filter(item => item !== fruit);
      }

      if (!fruitRule) {
        return prev;
      }

      if (prev.length >= fruitRule.max) {
        return prev;
      }

      return [...prev, fruit];
    });
  };

  const handleAdd = () => {
    if (!fruitRequirementMet) {
      return;
    }

    const signature = [
      product.id,
      sizeOz ?? 'nosize',
      isLehmuhn ? selectedType : selectedGroup,
      !isLehmuhn ? activeKohfeeSubGroup : 'nosub',
      hotOption,
      toppingsRemoved ? 'remove_toppings' : 'keep_toppings',
      addOns.map(addOn => addOn.id).sort().join('|'),
      selectedFruits.slice().sort().join('|'),
    ].join('__');

    onAddToCart({
      cartItemId: signature,
      productId: product.id,
      storeId: product.storeId,
      name: product.name,
      description: product.description,
      image: product.image,
      basePrice,
      quantity,
      isPremium: product.isPremium,
      selectedSizeOz: sizeOz,
      selectedDrinkType: isLehmuhn ? selectedType : undefined,
      selectedMenuGroup: !isLehmuhn ? selectedGroup : undefined,
      selectedSubGroup: !isLehmuhn && selectedGroup !== 'FOOD' ? activeKohfeeSubGroup : undefined,
      addOns,
      toppingsRemoved,
      toppingsLabel: product.defaultToppingsLabel,
      toppingsCost: product.defaultToppingsCost,
      selectedHotOption: hotOption || undefined,
      selectedFruits: selectedFruits.length > 0 ? selectedFruits : undefined,
    });
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[412px] bg-white rounded-t-[24px] z-[60] flex flex-col"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#E0E0E0]" />
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto min-h-0"
          style={{ overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch' }}
        >
        {/* Image */}
        <div className="h-[200px] mx-4 rounded-[16px] overflow-hidden relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center cursor-pointer"
          >
            <X size={18} color="#362415" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-4">
          <h2 className="text-[22px] text-[#362415]" style={{ fontWeight: 700 }}>{product.name}</h2>
          <p className="text-[14px] text-[#757575] mt-1">{product.description}</p>
          <p className="text-[20px] text-[#00704A] mt-2" style={{ fontWeight: 700 }}>&#8369;{basePrice}</p>

          {/* Size */}
          {allowedSizes.length > 0 && (
            <div className="mt-5">
              <h4 className="text-[14px] text-[#362415] mb-2" style={{ fontWeight: 600 }}>Size</h4>
              <div className="flex gap-2">
                {allowedSizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSizeOz(size)}
                  className={`flex-1 py-2.5 rounded-[12px] text-[13px] cursor-pointer border transition-all ${
                    sizeOz === size
                      ? 'bg-[#00704A] text-white border-[#00704A]'
                      : 'bg-white text-[#362415] border-[rgba(0,0,0,0.12)]'
                  }`}
                  style={{ fontWeight: sizeOz === size ? 600 : 400 }}
                >
                  {SIZE_LABELS[size]}
                  <span className="block text-[11px] opacity-70">{size}oz — &#8369;{getPriceForSize(product, size)}</span>
                </button>
              ))}
              </div>
            </div>
          )}

          {product.defaultToppingsLabel && (
            <div className="mt-5">
              <h4 className="text-[14px] text-[#362415] mb-2" style={{ fontWeight: 600 }}>Toppings removal</h4>
              <button
                onClick={() => setToppingsRemoved(prev => !prev)}
                className={cn(
                  'w-full flex items-center justify-between py-2.5 px-3 rounded-[12px] border cursor-pointer transition-all text-left',
                  toppingsRemoved ? 'bg-[#FFF3E0] border-[#FFB74D]' : 'bg-white border-[rgba(0,0,0,0.12)]',
                )}
              >
                <div>
                  <span className="text-[14px] text-[#362415]">No toppings</span>
                  <p className="text-[11px] text-[#757575]">Default: {product.defaultToppingsLabel}</p>
                </div>
                {toppingsRemoved && <Check size={18} color="#E65100" />}
              </button>
            </div>
          )}

          {isLehmuhn && LEHMUHN_ADD_ONS.length > 0 && (
            <div className="mt-5">
              <h4 className="text-[14px] text-[#362415] mb-2" style={{ fontWeight: 600 }}>Add-ons</h4>
              <div className="space-y-2">
                {LEHMUHN_ADD_ONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleAddOn(option)}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-[12px] border cursor-pointer transition-all text-left"
                  style={{
                    borderColor: addOns.some(addOn => addOn.id === option.id) ? '#00704A' : 'rgba(0,0,0,0.12)',
                    backgroundColor: addOns.some(addOn => addOn.id === option.id) ? '#E8F5E9' : 'white',
                  }}
                >
                  <span className="text-[14px] text-[#362415]">{option.name}</span>
                  {addOns.some(addOn => addOn.id === option.id) && <Check size={18} color="#00704A" />}
                </button>
              ))}
            </div>
            </div>
          )}

          {isLehmuhn && product.hotOptions && product.hotOptions.length > 0 && (
            <div className="mt-5">
              <h4 className="text-[14px] text-[#362415] mb-2" style={{ fontWeight: 600 }}>Hot options</h4>
              <div className="grid grid-cols-2 gap-2">
                {product.hotOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setHotOption(option)}
                    className={cn(
                      'py-2 rounded-[10px] text-[12px] border cursor-pointer transition-all',
                      hotOption === option
                        ? 'bg-[#00704A] text-white border-[#00704A]'
                        : 'bg-white text-[#362415] border-[rgba(0,0,0,0.12)]',
                    )}
                    style={{
                      fontWeight: hotOption === option ? 600 : 400,
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLehmuhn && fruitRule && (
            <div className="mt-5">
              <h4 className="text-[14px] text-[#362415] mb-2" style={{ fontWeight: 600 }}>
                Choose {fruitRule.min} fruits
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {fruitRule.options.map(option => {
                  const active = selectedFruits.includes(option);
                  const locked = !active && selectedFruits.length >= fruitRule.max;
                  return (
                    <button
                      key={option}
                      onClick={() => toggleFruit(option)}
                      disabled={locked}
                      className={cn(
                        'py-2 rounded-[10px] text-[12px] border cursor-pointer transition-all',
                        active
                          ? 'bg-[#00704A] text-white border-[#00704A]'
                          : 'bg-white text-[#362415] border-[rgba(0,0,0,0.12)]',
                        locked ? 'opacity-40 cursor-not-allowed' : '',
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#757575] mt-1">
                Selected: {selectedFruits.length}/{fruitRule.max}
              </p>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-5 flex items-center justify-between">
            <h4 className="text-[14px] text-[#362415]" style={{ fontWeight: 600 }}>Quantity</h4>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-full border border-[rgba(0,0,0,0.12)] flex items-center justify-center cursor-pointer"
              >
                <Minus size={16} color="#362415" />
              </button>
              <span className="text-[18px] text-[#362415] w-8 text-center" style={{ fontWeight: 600 }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-full bg-[#00704A] flex items-center justify-center cursor-pointer"
              >
                <Plus size={16} color="white" />
              </button>
            </div>
          </div>
        </div>
        </div>

        {/* Sticky Add to Cart */}
        <div className="shrink-0 px-5 pt-3 pb-6 bg-white border-t border-[rgba(0,0,0,0.06)]">
          <button
            onClick={handleAdd}
            disabled={!fruitRequirementMet}
            className="w-full py-4 rounded-[16px] text-white text-[16px] cursor-pointer"
            style={{
              background: '#00704A',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(0,112,74,0.3)',
              opacity: fruitRequirementMet ? 1 : 0.5,
            }}
          >
            Add to Cart &mdash; &#8369;{totalPrice}
          </button>
        </div>
      </motion.div>
    </>
  );
}
