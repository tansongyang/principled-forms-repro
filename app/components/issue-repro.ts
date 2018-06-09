import Component from '@ember/component';

import { action } from '@ember-decorators/object';
import Field, { validate, Validate } from '@olo/principled-forms/field';
import EmailField from '@olo/principled-forms/field/email';
import NumberField from '@olo/principled-forms/field/number';
import { isValid } from '@olo/principled-forms/form';
import { minValue } from '@olo/principled-forms/validators';
import { FormProp, FormValue, FromModel } from '@olo/principled-forms/form';
import update from 'ember-object-update';
import Maybe from 'true-myth/maybe';

export type User = {
  firstName: string;
  middleName: Maybe<string>;
  lastName: string;
  age: number;
  primaryEmail: string;
  secondaryEmail: Maybe<string>;
}

const ageValidators = [minValue(13)];

const makeUserFormFromModel: FromModel<User> = user => ({
  firstName: Field.required(),
  middleName: Field.optional({ value: user.middleName }),
  lastName: Field.required({ value: user.lastName }),
  age: NumberField.required({ value: user.age, validators: ageValidators }),
  primaryEmail: EmailField.required({ value: user.primaryEmail }),
  secondaryEmail: EmailField.optional({ value: user.secondaryEmail }),
});

export default class IssueRepro extends Component.extend({
  // anything which *must* be merged to prototype here
}) {
  userForm = makeUserFormFromModel({
    firstName: 'Foo',
    middleName: Maybe.just('Bar'),
    lastName: 'Baz',
    age: 9001,
    primaryEmail: 'foobaz@mail.com',
    secondaryEmail: Maybe.nothing(),
  });

  @action
  handleChange(property: FormProp<User>, value: FormValue<User>) {
    update(this.userForm, property, field => validate({ ...field, value }) as any);
  }

  @action
  handleInput(property: FormProp<User>, value: FormValue<User>) {
    update(this.userForm, property, field => validate({ ...field, value }, Validate.Lazily) as any);
  }

  @action
  submit() {
    if (!isValid(this.userForm)) {
      alert('Invalid!');
    } else {
      const values = {} as any;
      Object.entries(this.userForm).forEach(([key, value]) => {
        values[key] = value.value;
      });
      alert(JSON.stringify(values, undefined, 2));
    }
  }
};
