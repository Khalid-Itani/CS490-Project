import React from 'react';
import { Icon, IconNames } from './Icon';

const IconDemo = () => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
  const variants = ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'white'];

  return (
    <div className="p-6 space-y-8">
      {/* Icon Sizes */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Icon Sizes</h2>
        <div className="flex items-center gap-4">
          {sizes.map(size => (
            <div key={size} className="flex flex-col items-center gap-2">
              <Icon name="user" size={size} />
              <span className="text-sm">{size}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Icon Variants */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Icon Variants</h2>
        <div className="flex items-center gap-4">
          {variants.map(variant => (
            <div key={variant} className="flex flex-col items-center gap-2">
              <Icon name="info" variant={variant} size="lg" />
              <span className="text-sm">{variant}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Common Icons */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Common Icons</h2>
        <div className="grid grid-cols-6 gap-4">
          {IconNames.map(name => (
            <div key={name} className="flex flex-col items-center gap-2 p-2">
              <Icon name={name} />
              <span className="text-sm text-center">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Loading State */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Loading State</h2>
        <Icon name="loading" spin size="lg" />
      </section>
    </div>
  );
};

export default IconDemo;