import { EpiFormulaTokenPipe } from './epi-formula-token.pipe';

describe('EpiFormulaTokenPipe', () => {
  const pipe = new EpiFormulaTokenPipe();

  it('should return null for null or undefined', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('should render an empty token', () => {
    expect(pipe.transform({ tags: [], values: [] })).toBe('<>');
  });

  it('should render tags and values', () => {
    expect(
      pipe.transform({ tags: ['n', 'gen'], values: ['dis', 'deis'] }),
    ).toBe('<n.gen dis/deis>');
  });

  it('should render only values without tags', () => {
    expect(pipe.transform({ tags: [], values: ['manibus'] })).toBe(
      '<manibus>',
    );
  });

  it('should render optional token in square brackets', () => {
    expect(
      pipe.transform({ tags: ['v'], values: ['fecit'], isOptional: true }),
    ).toBe('[v fecit]');
  });

  it('should render placeholder marker', () => {
    expect(
      pipe.transform({ tags: ['name'], values: [], isPlaceholder: true }),
    ).toBe('<name $>');
  });

  it('should render note in braces', () => {
    expect(
      pipe.transform({ tags: [], values: ['x'], note: 'abbreviated' }),
    ).toBe('<x {abbreviated}>');
  });

  it('should tolerate missing tags and values arrays', () => {
    expect(
      pipe.transform({
        tags: undefined as unknown as string[],
        values: undefined as unknown as string[],
      }),
    ).toBe('<>');
  });
});
