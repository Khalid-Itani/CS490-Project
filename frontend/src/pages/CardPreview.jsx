import React from 'react';
import { Card, Container, Section } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';

export default function CardPreview() {
  return (
    <div className="space-y-8">
      {/* Basic Cards */}
      <Section>
        <Container>
          <h2 className="text-2xl font-semibold mb-4">Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Default Card */}
            <Card>
              <Card.Header>
                <Card.Title>Default Card</Card.Title>
                <Card.Description>Basic card with default styling</Card.Description>
              </Card.Header>
              <Card.Body>
                <p>This is the content of a default card.</p>
              </Card.Body>
            </Card>

            {/* Interactive Card */}
            <Card variant="interactive" onClick={() => alert('Card clicked!')}>
              <Card.Header>
                <Card.Title>Interactive Card</Card.Title>
                <Card.Description>Click me!</Card.Description>
              </Card.Header>
              <Card.Body>
                <p>This card has hover and active states.</p>
              </Card.Body>
            </Card>

            {/* Outline Card */}
            <Card variant="outline">
              <Card.Header>
                <Card.Title>Outline Card</Card.Title>
                <Card.Description>With border emphasis</Card.Description>
              </Card.Header>
              <Card.Body>
                <p>This card has a more prominent border.</p>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Card Sizes */}
      <Section className="bg-gray-50">
        <Container>
          <h2 className="text-2xl font-semibold mb-4">Card Sizes</h2>
          <div className="space-y-4">
            <Card size="small">
              <Card.Title>Small Card</Card.Title>
              <p>Compact padding for dense content.</p>
            </Card>

            <Card>
              <Card.Title>Default Card</Card.Title>
              <p>Standard padding for most use cases.</p>
            </Card>

            <Card size="large">
              <Card.Title>Large Card</Card.Title>
              <p>Spacious padding for prominent content.</p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Example Use Cases */}
      <Section>
        <Container>
          <h2 className="text-2xl font-semibold mb-4">Example Use Cases</h2>
          
          {/* Job Card Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card variant="hover" to="/jobs/123">
              <Card.Header>
                <div className="flex justify-between items-start">
                  <div>
                    <Card.Title>Senior Frontend Developer</Card.Title>
                    <Card.Description>TechCorp Inc.</Card.Description>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    New
                  </span>
                </div>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-gray-600">
                  Join our team to build amazing user experiences with React and TypeScript.
                </p>
              </Card.Body>
              <Card.Footer>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Icon name="user" size="sm" />
                    Remote
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="job" size="sm" />
                    Full-time
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">$120k-$150k</span>
              </Card.Footer>
            </Card>

            {/* Application Card Example */}
            <Card variant="outline">
              <Card.Header>
                <div className="flex justify-between items-start">
                  <div>
                    <Card.Title>Application Status</Card.Title>
                    <Card.Description>Frontend Developer at TechCorp</Card.Description>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    In Review
                  </span>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-blue-500 rounded-full" />
                  </div>
                  <span className="text-sm text-gray-600">2/4 steps</span>
                </div>
              </Card.Body>
              <Card.Footer>
                <button className="btn btn-secondary btn-sm">View Details</button>
                <button className="btn btn-primary btn-sm">Continue</button>
              </Card.Footer>
            </Card>
          </div>

          {/* Document Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {['Resume', 'Cover Letter', 'Portfolio', 'References'].map((doc) => (
              <Card key={doc} variant="subtle" className="text-center">
                <div className="mb-3">
                  <Icon name="document" size="lg" className="mx-auto" />
                </div>
                <Card.Title as="h4">{doc}</Card.Title>
                <Card.Description>Last updated 2d ago</Card.Description>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Container Sizes */}
      <Section className="bg-gray-50">
        <Container size="small" className="mb-8">
          <Card>
            <Card.Title>Small Container</Card.Title>
            <p>Max width of 48rem (768px)</p>
          </Card>
        </Container>

        <Container className="mb-8">
          <Card>
            <Card.Title>Default Container</Card.Title>
            <p>Max width of 64rem (1024px)</p>
          </Card>
        </Container>

        <Container size="large">
          <Card>
            <Card.Title>Large Container</Card.Title>
            <p>Max width of 80rem (1280px)</p>
          </Card>
        </Container>
      </Section>
    </div>
  );
}